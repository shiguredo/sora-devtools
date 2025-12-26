import { Container, Nav, Navbar } from "react-bootstrap";

import { connectionStatus, sora, turnUrl } from "@/app/signals";

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
        <Container>
          <Navbar.Brand href="/">Sora DevTools</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-collapse" />
          <Navbar.Collapse id="navbar-collapse">
            <Nav className="me-auto" />
            <Nav>
              <Navbar.Text className="py-0 my-1 mx-1">
                <p className="navbar-signaling-url border rounded">
                  {sora.value && connectionStatus.value === "connected"
                    ? sora.value.connectedSignalingUrl
                    : "Signaling URL"}
                </p>
              </Navbar.Text>
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
