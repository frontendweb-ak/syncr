// app/(auth)/_components/VerifyEmailAside.tsx

import { Clock3, MailCheck, ShieldCheck } from "lucide-react";

export default function VerifyEmailAside() {
  return (
    <div className="flex h-full flex-col justify-center px-12 py-16 text-white">
      <div className="max-w-lg">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur">
          <MailCheck className="h-8 w-8" />
        </div>

        <h2 className="mb-4 text-4xl font-bold leading-tight">
          One last step.
        </h2>

        <p className="mb-12 text-lg leading-8 text-white/80">
          Verify your email address to activate your AIM account and start
          learning with mentors across India.
        </p>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <ShieldCheck className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-semibold">Secure Account</h3>

              <p className="mt-1 text-sm text-white/70">
                Email verification keeps your account protected and prevents
                unauthorized access.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <Clock3 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-semibold">Code expires in 10 minutes</h3>

              <p className="mt-1 text-sm text-white/70">
                Didn't receive it? You can request a new verification code
                anytime.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <MailCheck className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-semibold">Almost there</h3>

              <p className="mt-1 text-sm text-white/70">
                Once verified, you'll be able to complete your profile and
                explore mentors, courses, and learning programs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
