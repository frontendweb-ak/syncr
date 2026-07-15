import { CheckCircle2, GraduationCap, Sparkles } from "lucide-react";

export default function VerifySuccessAside() {
  return (
    <div className="flex h-full flex-col justify-center px-12 py-16 text-white">
      <div className="max-w-lg">
        <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <CheckCircle2 className="h-8 w-8" />
        </div>

        <h2 className="mb-4 text-4xl font-bold">You're all set!</h2>

        <p className="mb-12 text-lg leading-8 text-white/80">
          Your email has been verified successfully. Welcome to AIM — your
          journey toward better learning and mentorship starts now.
        </p>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <GraduationCap className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-semibold">Discover Expert Mentors</h3>

              <p className="mt-1 text-sm text-white/70">
                Learn from experienced educators and industry professionals.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <Sparkles className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-semibold">Personalized Learning</h3>

              <p className="mt-1 text-sm text-white/70">
                Complete your profile to receive recommendations tailored to
                your goals.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="rounded-xl bg-white/10 p-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <div>
              <h3 className="font-semibold">Ready to Begin</h3>

              <p className="mt-1 text-sm text-white/70">
                Your account is verified and fully activated.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
