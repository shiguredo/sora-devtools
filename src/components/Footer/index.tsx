import Sora from "sora-js-sdk";

import { version } from "@/app/signals";
import { Navbar, NavbarCollapse } from "@/components/ui";

import { DebugButton } from "./DebugButton.tsx";

export function Footer() {
  return (
    <footer>
      <Navbar variant="dark" bg="sora" expand="md" fixed="bottom" className="py-0.5 pr-3">
        <div className="mr-auto" />
        <div className="flex items-center">
          <NavbarCollapse>
            <a
              href="https://github.com/shiguredo/sora-devtools"
              className={`
                inline-block text-xs font-normal leading-tight text-center no-underline align-middle
                cursor-pointer select-none border border-bs-light rounded
                px-1.5 py-0.5 mx-1
                text-bs-light bg-transparent
                hover:text-bs-dark hover:bg-bs-light
                transition-colors duration-150
              `}
            >
              shiguredo/sora-devtools: {version.value}
            </a>
            <a
              href="https://github.com/shiguredo/sora-js-sdk"
              className={`
                inline-block text-xs font-normal leading-tight text-center no-underline align-middle
                cursor-pointer select-none border border-bs-light rounded
                px-1.5 py-0.5 mx-1
                text-bs-light bg-transparent
                hover:text-bs-dark hover:bg-bs-light
                transition-colors duration-150
              `}
            >
              shiguredo/sora-js-sdk: {Sora.version()}
            </a>
          </NavbarCollapse>
        </div>
      </Navbar>
      <DebugButton />
    </footer>
  );
}
