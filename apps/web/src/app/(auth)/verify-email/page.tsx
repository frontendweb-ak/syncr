"use client";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils";
import { MailCheck } from "lucide-react";
import Link from "next/link";

export default function VerifyEmail({
  className,
  email = "john@example.com",
  ...props
}: React.ComponentProps<"form"> & {
  email?: string;
}) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <MailCheck className="h-8 w-8 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">Verify your email</h1>

          <p className="text-sm text-muted-foreground">
            We've sent a verification code to
          </p>

          <p className="font-medium">{email}</p>
        </div>

        <Field>
          <FieldLabel htmlFor="otp">Verification Code</FieldLabel>

          <Input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter 6-digit code"
            required
          />

          <FieldDescription>
            Enter the verification code sent to your email.
          </FieldDescription>
        </Field>

        <Field>
          <Button type="submit" className="w-full">
            Verify Email
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Didn't receive the code?{" "}
          <button
            type="button"
            className="font-medium text-primary hover:underline"
          >
            Resend Code
          </button>
        </FieldDescription>

        <FieldDescription className="text-center">
          <Link href="/login" className="underline underline-offset-4">
            Back to Login
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
