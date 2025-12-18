import type { FunctionComponent } from "preact";

import { $connectionStatus, $sora, $turnUrl } from "@/app/store";

import { CopyUrlButton } from "./CopyUrlButton.tsx";
import { DebugButton } from "./DebugButton.tsx";
import { DownloadReportButton } from "./DownloadReportButton.tsx";

export const Header: FunctionComponent = () => {
  const signalingUrl =
    $sora.value && $connectionStatus.value === "connected"
      ? $sora.value.connectedSignalingUrl
      : null;

  const turnUrlLabel =
    $sora.value && $connectionStatus.value === "connected" ? ($turnUrl.value ?? "不明") : null;

  return (
    <header>
      <nav className="header-nav">
        <a className="header-brand" href="/">
          Sora DevTools
        </a>
        <div className="header-status">
          {signalingUrl && <span className="header-status-badge">{signalingUrl}</span>}
          {turnUrlLabel && <span className="header-status-badge">{turnUrlLabel}</span>}
        </div>
        <div className="header-actions">
          <DebugButton />
          <DownloadReportButton />
          <CopyUrlButton />
        </div>
      </nav>
    </header>
  );
};
