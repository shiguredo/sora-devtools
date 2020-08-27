import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import Sora from "sora-js-sdk";

import ButtonCopyURL from "@/components/ButtonCopyURL";
import FormDebug from "@/components/FormDebug";

type Props = {
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
            <Navbar.Text className="mr-3">sora-js-sdk version: {Sora.version()}</Navbar.Text>
            <Navbar.Text className="mr-3">
              <FormDebug />
            </Navbar.Text>
            <ButtonCopyURL />
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    </header>
  );
};

export default Header;
