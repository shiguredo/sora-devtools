import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

import { CopyURL } from "@/components/Button/CopyURL";
import { DownloadReport } from "@/components/Button/DownloadReport";
import { EnabledParameters } from "@/utils";

type Props = {
  enabledParameters: EnabledParameters;
  pageName: string;
};
export const Header: React.FC<Props> = (props) => {
  return (
    <header>
      <Navbar variant="dark" bg="sora" expand="md" fixed="top">
        <Container>
          <Navbar.Brand href="/">Sora DEMO</Navbar.Brand>
          <Nav>
            <Navbar.Text>{props.pageName}</Navbar.Text>
          </Nav>
          <Navbar.Toggle aria-controls="navbar-collapse" />
          <Navbar.Collapse id="navbar-collapse">
            <Nav className="me-auto" />
            <Nav>
              <Navbar.Text className="mx-1">
                <DownloadReport pageName={props.pageName} />
              </Navbar.Text>
              <Navbar.Text className="mx-1">
                <CopyURL enabledParameters={props.enabledParameters} />
              </Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};
