"use client";

import { icons, type LucideProps } from "lucide-react";

type IconName = keyof typeof icons;

export interface IconProps extends Omit<LucideProps, "ref"> {
  name: IconName;
}

export default function Icon({
  name,
  size = 20,
  strokeWidth = 2,
  ...props
}: IconProps) {
  const LucideIcon = icons[name];

  if (!LucideIcon) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`Unknown icon: ${name}`);
    }
    return null;
  }

  return <LucideIcon size={size} strokeWidth={strokeWidth} {...props} />;
}
