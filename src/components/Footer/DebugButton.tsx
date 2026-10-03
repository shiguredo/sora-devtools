import { setDebug } from "@/app/actions";
import { debug } from "@/app/signals";

import styles from "./DebugButton.module.css";

export function DebugButton() {
  const onClick = (): void => {
    setDebug(!debug.value);
  };
  // モバイル表示時（768px 未満）のみ表示
  const stateClassName = debug.value ? styles.debugOn : styles.debugOff;
  return (
    <div>
      <button type="button" className={`${styles.button} ${stateClassName}`} onClick={onClick}>
        debug
      </button>
    </div>
  );
}
