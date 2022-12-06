import Script from "next/script";
import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import Sora from "sora-js-sdk";

import { useAppSelector } from "@/app/hooks";

import { DebugButton } from "./DebugButton";

export const Footer: React.FC = () => {
  const version = useAppSelector((state) => state.version);
  return (
    <footer>
      <Navbar variant="dark" bg="sora" expand="md" fixed="bottom">
        <Nav className="me-auto" />
        <Nav>
          <Navbar.Collapse id="navbar-collapse">
            <a href="https://github.com/shiguredo/sora-devtools" className="btn btn-outline-light m-1">
              GitHub: shiguredo/sora-devtools: {version}
            </a>
            <a href="https://github.com/shiguredo/sora-js-sdk" className="btn btn-outline-light m-1">
              GitHub: shiguredo/sora-js-sdk: {Sora.version()}
            </a>
          </Navbar.Collapse>
        </Nav>
      </Navbar>
      <Script id="foobar">
        {`
        // TODO: service worker の登録は別の箇所で行う
        if('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js').then((registration) => {
        console.log("register service worker");
          registration.addEventListener('updatefound', () => {
            const newServiceWorker = registration.installing;
            newServiceWorker.addEventListener('statechange', () => {
              if (newServiceWorker.state == 'activated') {
                location.reload();
              }
            });
          });
        })
        }
      `}
      </Script>
      <DebugButton />
    </footer>
  );
};
