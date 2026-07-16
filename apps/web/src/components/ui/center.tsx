import clsx from "clsx";

export type CenterProps = React.HtmlHTMLAttributes<HTMLDivElement> & {
  fixed?: boolean;
};
export default function Center({
  fixed,
  children,
  className,
  ...rest
}: CenterProps) {
  const classes = clsx(
    "justify-center items-center flex",
    {
      "fixed top-0 right-0 left-0 bottom-0 z-50": fixed,
    },
    className,
  );
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  );
}
