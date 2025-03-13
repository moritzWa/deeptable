import { User } from '@shared/types';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { User as UserModel } from '../models/user';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

export interface ExportUsageResponse {
  canExport: boolean;
  message?: string;
  currentUsage?: number;
  limit?: number;
}

export const authRouter = router({
  googleLogin: publicProcedure
    .input(z.object({ credential: z.string() }))
    .mutation(async ({ input }) => {
      try {
        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
          idToken: input.credential,
          audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();
        if (!payload) throw new Error('No payload');
        
        // Find or create user
        let user = await UserModel.findOne({ googleId: payload.sub });
        
        if (!user) {
          user = await UserModel.create({
            email: payload.email,
            name: payload.name,
            googleId: payload.sub,
            picture: payload.picture,
          });
        }

        // Generate JWT
        const token = jwt.sign(
          { userId: user._id },
          process.env.AUTH_SECRET || 'fallback-secret',
          { expiresIn: '7d' }
        );

        return {
          token,
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            picture: user.picture,
          } satisfies User,
        };
      } catch (error) {
        console.error('Google login error:', error);
        throw new Error('Authentication failed');
      }
    }),

  getUser: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
          throw new Error('User not found');
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          picture: user.picture,
          hasSubscription: user.hasSubscription,
        } satisfies User;
      } catch (error) {
        console.error('Get user error:', error);
        throw new Error('Failed to get user information');
      }
    }),

  checkAndIncrementExportUsage: publicProcedure
    .input(z.object({ token: z.string() }))
    .mutation(async ({ input }): Promise<ExportUsageResponse> => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
          throw new Error('User not found');
        }

        // If user has subscription, allow unlimited usage
        if (user.hasSubscription) {
          return { canExport: true };
        }
                
        // For free users, check usage limit
        const FREE_EXPORT_LIMIT = 4;
        if (user.exportActionUsageCount >= FREE_EXPORT_LIMIT) {
          return { 
            canExport: false,
            message: "You've reached the free export limit. Upgrade to Pro for unlimited exports.",
            currentUsage: user.exportActionUsageCount,
            limit: FREE_EXPORT_LIMIT
          };
        }

        // Increment usage count
        user.exportActionUsageCount += 1;
        await user.save();

        return { 
          canExport: true,
          currentUsage: user.exportActionUsageCount,
          limit: FREE_EXPORT_LIMIT
        };
      } catch (error) {
        console.error('Check export usage error:', error);
        throw new Error('Failed to check export usage');
      }
    })
}); 