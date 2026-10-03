import { disposeMedia } from "@/app/actions";
import { isFormDisabled, localMediaStream, role, sora } from "@/app/signals";
import { Button } from "@/components/ui";

import styles from "./DisposeMediaButton.module.css";

export function DisposeMediaButton() {
  const onClick = (): void => {
    void disposeMedia();
  };
  // recvonly: localMediaStream を持たない
  // sora !== null: 接続中は dispose せず disconnectSora 経由でクリーンアップ
  // localMediaStream === null: そもそも dispose 対象が無い
  // isFormDisabled: connecting / preparing / connected の同期防止
  const disabled =
    role.value === "recvonly" ||
    sora.value !== null ||
    localMediaStream.value === null ||
    isFormDisabled.value;
  return (
    <div className={`col-auto ${styles.root}`}>
      <Button variant="outline-secondary" onClick={onClick} disabled={disabled}>
        dispose media
      </Button>
    </div>
  );
}
