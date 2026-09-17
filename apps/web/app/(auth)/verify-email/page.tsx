import { VerifyEmailForm } from '@/components/auth/verify-email-form';

export const metadata = {
  title: 'Verify Email - MeetSync',
  description: 'Verify your email address',
};

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h1 className="text-center text-3xl font-bold tracking-tight">
              Verify your email
            </h1>
            <p className="mt-2 text-center text-sm text-gray-600">
              We sent a verification code to your email address
            </p>
          </div>

          <div className="rounded-lg bg-white p-8 shadow-lg">
            <VerifyEmailForm />
          </div>
        </div>
      </div>
    </div>
  );
}
