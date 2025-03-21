import { defaultPage, LINK_TO_WAITLIST } from '@/App';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useCallback, useEffect } from 'react';

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      window.location.href = defaultPage;
    }
  }, []);

  const handleGoogleSuccess = useCallback(async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) return;

    try {
      const response = await trpc.auth.googleLogin.mutate({
        credential: credentialResponse.credential,
      });

      // Store the token in localStorage
      localStorage.setItem('token', response.token);

      // You can also store user data or redirect
      console.log('Logged in user:', response.user);

      // Check if we should redirect to waitlist or home page
      if (LINK_TO_WAITLIST) {
        window.location.href = '/waitlist-form';
      } else {
        window.location.href = defaultPage;
      }
    } catch (error) {
      console.error('Login failed:', error);
    }
  }, []);

  return (
    <div className={cn('flex flex-col w-full gap-6', className)} {...props}>
      <Card className="w-1/3">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>Login with your Google account</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log('Login Failed')}
                  />
                </div>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{' '}
                <button
                  onClick={() => (window.location.href = '/signup')}
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign up
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our <a href="/terms">Terms of Service</a> and{' '}
        <a href="/privacy">Privacy Policy</a>.
      </div>
    </div>
  );
}
