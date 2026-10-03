import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";

import { connectionStatus, signalingUrlCandidates, sora, turnUrl } from "@/app/signals";
import { Navbar, NavbarBrand, NavbarCollapse, NavbarText, NavbarToggle } from "@/components/ui";
import { SESSIONS_ENABLED } from "@/constants";

import styles from "./Header.module.css";

import { CopyUrlButton } from "./CopyUrlButton.tsx";
import { DebugButton } from "./DebugButton.tsx";
import { DownloadReportButton } from "./DownloadReportButton.tsx";
import { SessionsButton } from "./SessionsButton.tsx";
import { SignalingUrlModal } from "./SignalingUrlModal.tsx";

export function Header() {
  const showModal = useSignal(false);
  const signalingUrlRef = useRef<HTMLButtonElement>(null);

  const signalingUrlLabel = (() => {
    // 接続中は接続先の URL を表示
    if (sora.value && connectionStatus.value === "connected") {
      return sora.value.connectedSignalingUrl;
    }
    // 設定されていれば最初の URL を表示
    if (signalingUrlCandidates.value.length > 0) {
      return signalingUrlCandidates.value[0];
    }
    return "Signaling URL";
  })();

  const turnUrlLabel = (() => {
    if (sora.value && connectionStatus.value === "connected") {
      return turnUrl.value ?? "不明";
    }
    return "TURN URL";
  })();

  const handleSignalingUrlClick = () => {
    showModal.value = true;
  };

  // ヘッダー高さ 56px はナビゲーションバーの上下パディング (各 8px) と NavbarBrand (40px) の合計。
  // 基底クラスにパディングを持たせず className で明示する
  return (
    <header>
      <Navbar variant="dark" bg="sora" expand="lg" fixed="top" className={styles.nav}>
        <div className={`container ${styles.inner}`}>
          <NavbarBrand href="/">Sora DevTools</NavbarBrand>
          <NavbarToggle />
          <NavbarCollapse>
            <div className={styles.spacer} />
            <div className={styles.items}>
              <NavbarText className={styles.navText}>
                <button
                  ref={signalingUrlRef}
                  type="button"
                  className={styles.signalingButton}
                  onClick={handleSignalingUrlClick}
                >
                  {signalingUrlLabel}
                </button>
              </NavbarText>
              <SignalingUrlModal
                show={showModal.value}
                onClose={() => {
                  showModal.value = false;
                }}
                buttonRef={signalingUrlRef}
              />
              <NavbarText className={styles.navText}>
                <p className={styles.turnUrl}>{turnUrlLabel}</p>
              </NavbarText>
              <NavbarText className={styles.navText}>
                <DebugButton />
              </NavbarText>
              <NavbarText className={styles.navText}>
                <DownloadReportButton />
              </NavbarText>
              {SESSIONS_ENABLED && (
                <NavbarText className={styles.navText}>
                  <SessionsButton />
                </NavbarText>
              )}
              <NavbarText className={styles.navTextLast}>
                <CopyUrlButton />
              </NavbarText>
            </div>
          </NavbarCollapse>
        </div>
      </Navbar>
    </header>
  );
}
