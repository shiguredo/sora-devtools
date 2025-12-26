import { useRef, useState } from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

import { connectionStatus, signalingUrlCandidates, sora, turnUrl } from "@/app/signals";

import { CopyUrlButton } from "./CopyUrlButton.tsx";
import { DebugButton } from "./DebugButton.tsx";
import { DownloadReportButton } from "./DownloadReportButton.tsx";
import { SignalingUrlModal } from "./SignalingUrlModal.tsx";

export function Header() {
  const [showModal, setShowModal] = useState(false);
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
    setShowModal(true);
  };

  return (
    <header>
      <Navbar variant="dark" bg="sora" expand="lg" fixed="top">
        <Container>
          <Navbar.Brand href="/">Sora DevTools</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-collapse" />
          <Navbar.Collapse id="navbar-collapse">
            <Nav className="me-auto" />
            <Nav>
              <Navbar.Text className="py-0 my-1 mx-1">
                <button
                  ref={signalingUrlRef}
                  type="button"
                  className="btn btn-outline-light btn-sm navbar-signaling-url text-start"
                  onClick={handleSignalingUrlClick}
                >
                  {signalingUrlLabel}
                </button>
              </Navbar.Text>
              <SignalingUrlModal
                show={showModal}
                onClose={() => setShowModal(false)}
                buttonRef={signalingUrlRef}
              />
              <Navbar.Text className="py-0 my-1 mx-1">
                <p className="navbar-turn-url border rounded">{turnUrlLabel}</p>
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 mx-1">
                <DebugButton />
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 mx-1">
                <DownloadReportButton />
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 ms-1">
                <CopyUrlButton />
              </Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
}
