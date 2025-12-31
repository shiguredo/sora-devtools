import Sora from "sora-js-sdk";

import { version } from "@/app/signals";
import { Navbar, NavbarCollapse } from "@/components/ui";

import { DebugButton } from "./DebugButton.tsx";

export function Footer() {
  return (
    <footer>
      <Navbar variant="dark" bg="sora" expand="md" fixed="bottom">
        <div className="mr-auto" />
        <div className="flex items-center">
          <NavbarCollapse>
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
          </NavbarCollapse>
        </div>
      </Navbar>
      <DebugButton />
    </footer>
  );
}
