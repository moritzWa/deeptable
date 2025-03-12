import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { publicProcedure, router } from '../index';
import { User as UserModel } from '../models/user';
import { FormPreferences, User } from '../types';

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
);

// Helper to convert MongoDB document to FormPreferences
const toFormPreferences = (prefs: any): FormPreferences | undefined => {
  if (!prefs) return undefined;
  return {
    apiKey: prefs.apiKey || undefined,
    repositoryUrl: prefs.repositoryUrl || undefined,
    target_mode: prefs.target_mode || undefined,
    repos: prefs.repos || undefined,
    langJS: typeof prefs.langJS === 'boolean' ? prefs.langJS : undefined,
    langTS: typeof prefs.langTS === 'boolean' ? prefs.langTS : undefined,
    langPython: typeof prefs.langPython === 'boolean' ? prefs.langPython : undefined,
    langGo: typeof prefs.langGo === 'boolean' ? prefs.langGo : undefined,
    langRust: typeof prefs.langRust === 'boolean' ? prefs.langRust : undefined,
    langCpp: typeof prefs.langCpp === 'boolean' ? prefs.langCpp : undefined,
    langPerc: prefs.langPerc || undefined,
    followers: prefs.followers || undefined,
    following: prefs.following || undefined,
    account_created: prefs.account_created || undefined,
    repo_updated: prefs.repo_updated || undefined,
  };
};

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
          formPreferences: toFormPreferences(user.formPreferences),
          hasSubscription: user.hasSubscription,
        } satisfies User;
      } catch (error) {
        console.error('Get user error:', error);
        throw new Error('Failed to get user information');
      }
    }),

  updateFormPreferences: publicProcedure
    .input(z.object({
      token: z.string(),
      formPreferences: z.object({
        apiKey: z.string().optional(),
        repositoryUrl: z.string().optional(),
        target_mode: z.enum(["stargazers", "forks", "watchers", "contributors"]).optional(),
        repos: z.number().optional(),
        langJS: z.boolean().optional(),
        langTS: z.boolean().optional(),
        langPython: z.boolean().optional(),
        langGo: z.boolean().optional(),
        langRust: z.boolean().optional(),
        langCpp: z.boolean().optional(),
        langPerc: z.number().optional(),
        followers: z.number().optional(),
        following: z.number().optional(),
        account_created: z.number().optional(),
        repo_updated: z.number().optional(),
      }) satisfies z.ZodType<FormPreferences>
    }))
    .mutation(async ({ input }) => {
      try {
        const decoded = jwt.verify(input.token, process.env.AUTH_SECRET || 'fallback-secret') as { userId: string };
        const user = await UserModel.findById(decoded.userId);
        
        if (!user) {
          throw new Error('User not found');
        }

        user.formPreferences = input.formPreferences;
        await user.save();

        return {
          success: true,
          formPreferences: toFormPreferences(user.formPreferences),
        };
      } catch (error) {
        console.error('Update form preferences error:', error);
        throw new Error('Failed to update form preferences');
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