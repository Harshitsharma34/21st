import { LoginForm } from '@/components/auth/login-form';
import { OAuthButtons } from '@/components/auth/oauth-buttons';

export const metadata = {
  title: 'Sign In - MeetSync',
  description: 'Sign in to your MeetSync account',
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-center text-3xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Sign in to your MeetSync account
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-lg">
            <LoginForm />

            <div className="mt-6 space-y-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <OAuthButtons />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
