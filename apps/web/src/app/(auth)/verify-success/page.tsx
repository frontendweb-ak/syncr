"use client";

import { Button } from "@/components/ui/button";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function VerifySuccess() {
  return (
    <div className="flex flex-col gap-8">
      <FieldGroup>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
            <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-3xl font-bold">Email Verified!</h1>

          <p className="mt-3 max-w-md text-muted-foreground">
            Your email has been successfully verified. Your AIM account is now
            active and ready to use.
          </p>
        </div>

        <div className="rounded-xl border bg-muted/30 p-5">
          <h3 className="mb-3 font-semibold">What's next?</h3>

          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>✓ Complete your profile</li>
            <li>✓ Choose your learning interests</li>
            <li>✓ Connect with mentors</li>
            <li>✓ Start your learning journey</li>
          </ul>
        </div>

        <Button size="lg">
          <Link href="/onboarding">Continue</Link>
        </Button>

        <FieldDescription className="text-center">
          Already completed onboarding?{" "}
          <Link
            href="/dashboard"
            className="font-medium underline underline-offset-4"
          >
            Go to Dashboard
          </Link>
        </FieldDescription>
      </FieldGroup>
    </div>
  );
}
