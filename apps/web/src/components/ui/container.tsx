import clsx from "clsx";
import type { HTMLAttributes } from "react";

type ContainerProps = HTMLAttributes<HTMLDivElement>;

export default function Container({
  children,
  className,
  ...rest
}: ContainerProps) {
  const classes = clsx("mx-auto w-full max-w-[1240px] px-4 sm:px-6", className);
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
