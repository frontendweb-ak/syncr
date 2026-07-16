import clsx from "clsx";
import Container from "../ui/container";

export type FooterProps = React.HtmlHTMLAttributes<HTMLHtmlElement> & {};
export default function Footer({ className, ...rest }: FooterProps) {
  return (
    <footer
      className={clsx("text-center py-5 text-sm text-gray-600", className)}
      {...rest}
    >
      <Container>
        <p>
          &copy; {new Date().getFullYear()}, All rights reserved. powered by
          frontendweb.in
        </p>
      </Container>
    </footer>
  );
}
