import React from "react";
import { Container, Nav, Navbar } from "react-bootstrap";

import { CopyURL } from "@/components/Button/CopyURL";
import { ButtonDownloadReport } from "@/components/Button/DownloadReport";
import { ButtonHeaderDebugMode } from "@/components/Button/HeaderDebugMode";

type Props = {
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
              <Navbar.Text className="py-0 my-1 me-4">
                <ButtonHeaderDebugMode />
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1">
                <ButtonDownloadReport pageName={props.pageName} />
              </Navbar.Text>
              <Navbar.Text className="py-0 my-1">
                <CopyURL />
              </Navbar.Text>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};
