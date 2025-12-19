import type { FunctionComponent } from "preact";
import Sora from "sora-js-sdk";

import { $version } from "@/app/store";
import { DownloadReportButton } from "@/components/Header/DownloadReportButton.tsx";

export const Footer: FunctionComponent = () => {
  return (
    <footer>
      <nav className="footer-nav">
        <div className="footer-left">
          <DownloadReportButton />
        </div>
        <div className="footer-right">
          <a href="https://github.com/shiguredo/sora-devtools" className="footer-link">
            sora-devtools: {$version.value}
          </a>
          <a href="https://github.com/shiguredo/sora-js-sdk" className="footer-link">
            sora-js-sdk: {Sora.version()}
          </a>
        </div>
      </nav>
    </footer>
  );
};
