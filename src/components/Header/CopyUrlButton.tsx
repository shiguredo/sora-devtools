import { useSignal } from "@preact/signals";
import { useLocation } from "preact-iso";

import { copyURL } from "@/app/actions";

import styles from "./CopyUrlButton.module.css";

export function CopyUrlButton() {
  const copied = useSignal(false);
  const { route } = useLocation();

  const onClick = async (): Promise<void> => {
    const success = await copyURL();
    if (!success) {
      return;
    }
    route(`${globalThis.location.pathname}${globalThis.location.search}`, true);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  };

  return (
    <button
      type="button"
      className={`${styles.button} ${copied.value ? styles.copied : styles.idle}`}
      onClick={onClick}
    >
      {copied.value ? (
        <span className={styles.copiedContent}>
          Copied
          <svg className={styles.checkIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : (
        "Copy URL"
      )}
    </button>
  );
}
