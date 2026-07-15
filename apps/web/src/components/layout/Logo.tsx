import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
};

export function Logo({ size = 200, className }: LogoProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src="/images/logo.png"
        alt="AIM emblem"
        width={200}
        height={200}
        priority
      />
    </div>
  );
}
