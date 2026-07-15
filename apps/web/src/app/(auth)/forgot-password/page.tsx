import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Mail } from "lucide-react";

export default function ForgotPassword() {
  return (
    <form className="flex flex-col gap-6">
      <FieldGroup>
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Mail className="size-7 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">Forgot password?</h1>

          <p className="max-w-sm text-sm text-balance text-muted-foreground">
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email address</FieldLabel>

          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </Field>

        <Field>
          <Button type="submit" className="w-full">
            Send reset link
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Remember your password?{" "}
          <a href="/login" className="font-medium underline underline-offset-4">
            Sign in
          </a>
        </FieldDescription>

        <FieldDescription className="text-center">
          <a
            href="/login"
            className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Back to login
          </a>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
