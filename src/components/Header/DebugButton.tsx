import { setDebug } from "@/app/actions";
import { debug } from "@/app/signals";

import styles from "./DebugButton.module.css";

export function DebugButton() {
  const onClick = (): void => {
    setDebug(!debug.value);
  };
  return (
    <button
      type="button"
      className={`${styles.button} ${debug.value ? styles.enabled : styles.idle}`}
      onClick={onClick}
    >
      debug
    </button>
  );
}
