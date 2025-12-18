import type { FunctionComponent } from "preact";
import Sora from "sora-js-sdk";

import { $version } from "@/app/store";

export const Footer: FunctionComponent = () => {
  return (
    <footer>
      <nav className="footer-nav">
        <a href="https://github.com/shiguredo/sora-devtools" className="footer-link">
          sora-devtools: {$version.value}
        </a>
        <a href="https://github.com/shiguredo/sora-js-sdk" className="footer-link">
          sora-js-sdk: {Sora.version()}
        </a>
      </nav>
    </footer>
  );
};
