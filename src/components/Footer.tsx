import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { useSelector } from "react-redux";
import Sora from "sora-js-sdk";

import { SoraDemoState } from "@/app/slice";
import { DebugMode } from "@/components/Button/DebugMode";

export const Footer: React.FC = () => {
  const { version } = useSelector((state: SoraDemoState) => state);
  return (
    <footer>
      <Navbar variant="dark" bg="sora" expand="md" fixed="bottom">
        <Nav className="me-auto" />
        <Nav>
          <Navbar.Collapse id="navbar-collapse">
            <a href="https://github.com/shiguredo/sora-demo" className="btn btn-outline-light m-1">
              GitHub: shiguredo/sora-demo: {version}
            </a>
            <a href="https://github.com/shiguredo/sora-js-sdk" className="btn btn-outline-light m-1">
              GitHub: shiguredo/sora-js-sdk: {Sora.version()}
            </a>
          </Navbar.Collapse>
        </Nav>
      </Navbar>
      <DebugMode />
    </footer>
  );
};
