import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { useSelector } from "react-redux";
import Sora from "sora-js-sdk";

import { SoraDemoState } from "@/slice";

const Footer: React.FC = () => {
  const { version } = useSelector((state: SoraDemoState) => state);
  return (
    <footer>
      <Navbar variant="dark" bg="sora" expand="md" fixed="bottom" className="p-0">
        <Nav className="mr-auto" />
        <Nav>
          <Navbar.Collapse id="navbar-collapse">
            <Navbar.Text className="mr-3">sora-demo: {version}</Navbar.Text>
            <Navbar.Text className="mr-3">sora-js-sdk: {Sora.version()}</Navbar.Text>
            <Navbar.Text className="mx-1">
              <a href="https://github.com/shiguredo/sora-demo" className="btn btn-outline-light">
                GitHub: shiguredo/sora-demo
              </a>
            </Navbar.Text>
          </Navbar.Collapse>
        </Nav>
      </Navbar>
    </footer>
  );
};

export default Footer;
