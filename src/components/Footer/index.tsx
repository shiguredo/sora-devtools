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
              className={`
                inline-block font-normal leading-normal text-center no-underline align-middle
                cursor-pointer select-none border border-bs-light rounded-md
                px-3 py-1.5 m-1
                text-bs-light bg-transparent
                hover:text-bs-dark hover:bg-bs-light
                transition-colors duration-150
              `}
            >
              GitHub: shiguredo/sora-devtools: {version.value}
            </a>
            <a
              href="https://github.com/shiguredo/sora-js-sdk"
              className={`
                inline-block font-normal leading-normal text-center no-underline align-middle
                cursor-pointer select-none border border-bs-light rounded-md
                px-3 py-1.5 m-1
                text-bs-light bg-transparent
                hover:text-bs-dark hover:bg-bs-light
                transition-colors duration-150
              `}
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
