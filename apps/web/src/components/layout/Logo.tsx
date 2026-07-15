import Image from "next/image";

type LogoProps = {
  size?: number;
  className?: string;
};

export function Logo({ size = 200, className }: LogoProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <Image
        src="/logo-emblum.png"
        alt="AIM emblem"
        width={200}
        height={200}
        priority
      />

      <div className="text-center">
        <h1 className="font-black text-6xl tracking-wide">AIM</h1>
        <p className="text-sm font-semibold tracking-[0.35em] uppercase text-muted-foreground">
          All India Mentors
        </p>
      </div>
    </div>
  );
}
