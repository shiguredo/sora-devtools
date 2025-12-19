import { useSignal } from "@preact/signals";
import type { FunctionComponent } from "preact";

import {
  $connectionStatus,
  $signalingUrlCandidates,
  $sora,
  $turnUrl,
  $visiblePanels,
  togglePanel,
} from "@/app/store";

import { CopyUrlButton } from "./CopyUrlButton.tsx";
import { DebugButton } from "./DebugButton.tsx";
import { SignalingUrlModal } from "./SignalingUrlModal.tsx";

export const Header: FunctionComponent = () => {
  const showSignalingUrlModal = useSignal(false);

  const connectedSignalingUrl =
    $sora.value && $connectionStatus.value === "connected"
      ? $sora.value.connectedSignalingUrl
      : null;

  const turnUrlLabel =
    $sora.value && $connectionStatus.value === "connected" ? ($turnUrl.value ?? "不明") : null;

  // Display: connected URL or first configured URL or placeholder
  const displayUrl =
    connectedSignalingUrl ||
    ($signalingUrlCandidates.value.length > 0 ? $signalingUrlCandidates.value[0] : "未設定");

  const panelBtnClass = (panel: "signaling" | "media" | "device") =>
    `btn btn-sm ${$visiblePanels.value.has(panel) ? "btn-toggle-active" : "btn-toggle"}`;

  return (
    <header>
      <nav className="header-nav">
        <a className="header-brand" href="/">
          Sora DevTools
        </a>
        <div className="header-status">
          <button
            type="button"
            onClick={() => (showSignalingUrlModal.value = true)}
            className="header-signaling-url-btn"
            title="Click to configure Signaling URL"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span className="truncate max-w-xs">{displayUrl}</span>
          </button>
          {turnUrlLabel && <span className="header-status-badge">{turnUrlLabel}</span>}
        </div>
        <div className="header-actions">
          <button
            type="button"
            onClick={() => togglePanel("signaling")}
            className={panelBtnClass("signaling")}
            title="Toggle Signaling options panel"
          >
            Signaling
          </button>
          <button
            type="button"
            onClick={() => togglePanel("media")}
            className={panelBtnClass("media")}
            title="Toggle Media options panel"
          >
            Media
          </button>
          <button
            type="button"
            onClick={() => togglePanel("device")}
            className={panelBtnClass("device")}
            title="Toggle Device settings panel"
          >
            Device
          </button>
          <div className="header-separator" />
          <DebugButton />
          <CopyUrlButton />
        </div>
      </nav>
      <SignalingUrlModal
        isOpen={showSignalingUrlModal.value}
        onClose={() => (showSignalingUrlModal.value = false)}
      />
    </header>
  );
};
