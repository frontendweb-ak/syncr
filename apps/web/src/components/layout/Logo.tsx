import { cn } from "@/utils";
import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
  href?: string;
};

export function Logo({ href = "/", size = 120, className }: LogoProps) {
  return (
    <a
      href={href}
      className={cn("flex flex-col items-center gap-4", className)}
    >
      <Image
        src="/images/logo.png"
        alt="AIM emblem"
        width={size}
        height={100}
        priority
      />
    </a>
  );
}
