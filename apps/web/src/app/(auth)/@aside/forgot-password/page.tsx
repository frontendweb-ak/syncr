export default function ForgotPasswordAside() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-16 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md text-center">
        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
          <span className="text-5xl">🔒</span>
        </div>

        <h2 className="mb-4 text-4xl font-bold tracking-tight">
          Forgot your password?
        </h2>

        <p className="mb-8 text-lg leading-8 text-muted-foreground">
          It happens. Enter your email address and we'll send you a secure link
          to reset your password.
        </p>

        <div className="rounded-2xl border bg-background/70 p-6 text-left backdrop-blur">
          <h3 className="mb-3 font-semibold">What happens next?</h3>

          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>✓ Enter your registered email address.</li>
            <li>✓ We'll send a secure reset link.</li>
            <li>✓ Create a new password.</li>
            <li>✓ Sign in with your new credentials.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
