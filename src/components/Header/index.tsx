import { connectionStatus, sora, turnUrl } from "@/app/signals";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarText, NavbarToggle } from "@/components/ui";

import { CopyUrlButton } from "./CopyUrlButton.tsx";
import { DebugButton } from "./DebugButton.tsx";
import { DownloadReportButton } from "./DownloadReportButton.tsx";

export function Header() {
  const turnUrlLabel = (() => {
    if (sora.value && connectionStatus.value === "connected") {
      return turnUrl.value !== null ? turnUrl.value : "不明";
    }
    return "TURN URL";
  })();
  return (
    <header>
      <Navbar variant="dark" bg="sora" expand="lg" fixed="top">
        <div className="container flex items-center flex-nowrap justify-between px-3">
          <NavbarBrand href="/">Sora DevTools</NavbarBrand>
          <NavbarToggle />
          <NavbarCollapse>
            <div className="mr-auto" />
            <div className="flex items-center flex-wrap">
              <NavbarText className="py-0 my-1 mx-1">
                <p className="min-w-[250px] text-sm px-2 py-1 m-0 whitespace-nowrap border rounded">
                  {sora.value && connectionStatus.value === "connected"
                    ? sora.value.connectedSignalingUrl
                    : "Signaling URL"}
                </p>
              </NavbarText>
              <NavbarText className="py-0 my-1 mx-1">
                <p className="min-w-[250px] text-sm px-2 py-1 m-0 whitespace-nowrap border rounded">
                  {turnUrlLabel}
                </p>
              </NavbarText>
              <NavbarText className="py-0 my-1 mx-1">
                <DebugButton />
              </NavbarText>
              <NavbarText className="py-0 my-1 mx-1">
                <DownloadReportButton />
              </NavbarText>
              <NavbarText className="py-0 my-1 ml-1">
                <CopyUrlButton />
              </NavbarText>
            </div>
          </NavbarCollapse>
        </div>
      </Navbar>
    </header>
  );
}
