import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";

import { CopyUrlButton } from "./CopyUrlButton";
import { DebugButton } from "./DebugButton";
import { DownloadReportButton } from "./DownloadReportButton";

type Props = {
  pageName: string;
};
export const Header: React.FC<Props> = (props) => {
  const sora = useAppSelector((state) => state.soraContents.sora);
  return (
    <header>
      <Navbar variant="dark" bg="sora" expand="md" fixed="top">
        <Container>
          <Navbar.Brand href="/">Sora DevTools</Navbar.Brand>
          <Nav>
            <Navbar.Text>{props.pageName}</Navbar.Text>
          </Nav>
          <Navbar.Toggle aria-controls="navbar-collapse" />
          <Navbar.Collapse id="navbar-collapse">
            <Nav className="me-auto" />
            <Nav>
              <Navbar.Text className="py-0 my-1 mx-1">
                <p className="navbar-signaling-url border rounded">{sora ? sora.connectedSignalingUrl : "未接続"}</p>
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 mx-1">
                <DebugButton />
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1 mx-1">
                <DownloadReportButton pageName={props.pageName} />
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
};
