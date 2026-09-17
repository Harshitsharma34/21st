import { ResetPasswordForm } from '@/components/auth/reset-password-form';

export const metadata = {
  title: 'Reset Password - MeetSync',
  description: 'Create a new password for your MeetSync account',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-center text-3xl font-bold tracking-tight">
              Create new password
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the code from your email and your new password
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-lg">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
