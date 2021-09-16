import React from "react";
import { Nav, Navbar } from "react-bootstrap";

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
        <Navbar.Brand href="/">Sora DEMO</Navbar.Brand>
        <Nav>
          <Navbar.Text>{props.pageName}</Navbar.Text>
        </Nav>
        <Navbar.Toggle aria-controls="navbar-collapse" />
        <Navbar.Collapse id="navbar-collapse">
          <Nav className="mr-auto" />
          <Nav>
            <DownloadReport pageName={props.pageName} />
            <CopyURL enabledParameters={props.enabledParameters} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};
