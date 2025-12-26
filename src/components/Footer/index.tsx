import { Nav, Navbar } from "react-bootstrap";
import Sora from "sora-js-sdk";

import { version } from "@/app/signals";

import { DebugButton } from "./DebugButton.tsx";

export function Footer() {
  return (
    <footer>
      <Navbar variant="dark" bg="sora" expand="md" fixed="bottom">
        <Nav className="me-auto" />
        <Nav>
          <Navbar.Collapse id="navbar-collapse">
            <a
              href="https://github.com/shiguredo/sora-devtools"
              className="btn btn-outline-light m-1"
            >
              GitHub: shiguredo/sora-devtools: {version.value}
            </a>
            <a
              href="https://github.com/shiguredo/sora-js-sdk"
              className="btn btn-outline-light m-1"
            >
              GitHub: shiguredo/sora-js-sdk: {Sora.version()}
            </a>
          </Navbar.Collapse>
        </Nav>
      </Navbar>
      <DebugButton />
    </footer>
  );
}
