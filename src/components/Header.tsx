import React from "react";
import { Nav, Navbar } from "react-bootstrap";

import ButtonCopyURL from "@/components/Button/CopyURL";
import ButtonDownloadReport from "@/components/Button/DownloadReport";
import { EnabledParameters } from "@/utils";

type Props = {
  enabledParameters: EnabledParameters;
  pageName: string;
};
const Header: React.FC<Props> = (props) => {
  return (
    <header>
      <Navbar variant="dark" bg="sora" expand="md" fixed="top">
        <Navbar.Brand href="/">Sora DEMO</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbar-collapse" />
        <Navbar.Collapse id="navbar-collapse">
          <Nav className="mr-auto">
            <Navbar.Text>{props.pageName}</Navbar.Text>
          </Nav>
          <Nav>
            <ButtonDownloadReport pageName={props.pageName} />
            <ButtonCopyURL enabledParameters={props.enabledParameters} />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
