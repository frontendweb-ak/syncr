import Container from "../ui/container";
import { Logo } from "./Logo";

export default function Header() {
  return (
    <header>
      <Container>
        <Logo />
        <nav>
          <ul></ul>
        </nav>
      </Container>
    </header>
  );
}
