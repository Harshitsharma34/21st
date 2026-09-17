import { ForgotPasswordForm } from '@/components/auth/forgot-password-form';

export const metadata = {
  title: 'Forgot Password - MeetSync',
  description: 'Reset your MeetSync password',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-center text-3xl font-bold tracking-tight">
              Reset your password
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter your email address and we'll send you a code to reset your password
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-lg">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
