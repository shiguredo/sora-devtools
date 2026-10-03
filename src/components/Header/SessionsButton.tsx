import { useLocation } from "preact-iso";

import styles from "./SessionsButton.module.css";

export function SessionsButton() {
  const { path, route } = useLocation();
  const onSessionsPage = path === "/sessions";

  const onClick = (): void => {
    if (onSessionsPage) {
      // DevTools に戻る（signals は残るので接続状態は維持される）
      route("/");
      return;
    }
    route("/sessions");
  };

  return (
    <button
      type="button"
      // debug と同じ付け方（白文字 + 塗りつぶし）。色だけ debug のピンクと被らないようにする
      className={`${styles.button} ${onSessionsPage ? styles.active : styles.idle}`}
      onClick={onClick}
      aria-pressed={onSessionsPage}
    >
      Sessions
    </button>
  );
}
