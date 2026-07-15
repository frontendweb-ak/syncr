export default function ResetPasswordAside() {
  return (
    <div className="flex h-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-16 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-md text-center">
        <div className="mb-8 inline-flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
          <span className="text-5xl">🛡️</span>
        </div>

        <h2 className="mb-4 text-4xl font-bold tracking-tight">
          Create a new password
        </h2>

        <p className="mb-8 text-lg leading-8 text-muted-foreground">
          Choose a strong password to keep your account secure and protect your
          personal information.
        </p>

        <div className="rounded-2xl border bg-background/70 p-6 text-left backdrop-blur">
          <h3 className="mb-3 font-semibold">Strong password tips</h3>

          <ul className="space-y-3 text-sm text-muted-foreground">
            <li>✓ At least 8 characters long.</li>
            <li>✓ Include uppercase & lowercase letters.</li>
            <li>✓ Add numbers and special characters.</li>
            <li>✓ Avoid common words or personal information.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
