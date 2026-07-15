import { Logo } from "@/components/layout/Logo";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  aside: ReactNode;
};

export default function AuthLayout({ children, aside }: Props) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <aside className="relative hidden bg-muted lg:block">{aside}</aside>
    </div>
  );
}
