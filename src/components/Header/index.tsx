import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";

import { connectionStatus, signalingUrlCandidates, sora, turnUrl } from "@/app/signals";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarText, NavbarToggle } from "@/components/ui";

import { CopyUrlButton } from "./CopyUrlButton.tsx";
import { DebugButton } from "./DebugButton.tsx";
import { DownloadReportButton } from "./DownloadReportButton.tsx";
import { SignalingUrlModal } from "./SignalingUrlModal.tsx";

export function Header() {
  const showModal = useSignal(false);
  const signalingUrlRef = useRef<HTMLButtonElement>(null);

  const signalingUrlLabel = (() => {
    // 接続中は接続先の URL を表示
    if (sora.value && connectionStatus.value === "connected") {
      return sora.value.connectedSignalingUrl;
    }
    // 設定されていれば最初の URL を表示
    if (signalingUrlCandidates.value.length > 0) {
      return signalingUrlCandidates.value[0];
    }
    return "Signaling URL";
  })();

  const turnUrlLabel = (() => {
    if (sora.value && connectionStatus.value === "connected") {
      return turnUrl.value !== null ? turnUrl.value : "不明";
    }
    return "TURN URL";
  })();

  const handleSignalingUrlClick = () => {
    showModal.value = true;
  };

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
                <button
                  ref={signalingUrlRef}
                  type="button"
                  className="min-w-[250px] text-sm px-2 py-1 m-0 whitespace-nowrap border border-white/50 rounded text-left text-white bg-transparent hover:bg-white/10 transition-colors"
                  onClick={handleSignalingUrlClick}
                >
                  {signalingUrlLabel}
                </button>
              </NavbarText>
              <SignalingUrlModal
                show={showModal.value}
                onClose={() => {
                  showModal.value = false;
                }}
                buttonRef={signalingUrlRef}
              />
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
