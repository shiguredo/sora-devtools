import { deleteAlertMessage, setSoraReconnecting } from "@/app/actions";
import { alertMessages, reconnecting, reconnectingTrials } from "@/app/signals";
import { Toast, ToastBody, ToastHeader } from "@/components/ui";
import type { AlertMessage } from "@/types";
import { formatUnixtime } from "@/utils";

import styles from "./AlertMessages.module.css";

// reconnectSora の起動責務は本コンポーネントから外し、abend ハンドラ側に集約する。
// 本コンポーネントは Toast 表示専用とし、Toast の手動クローズ後に再 mount しても
// reconnectSora が二重起動しない。
function Reconnect() {
  const onClose = (): void => {
    setSoraReconnecting(false);
  };
  return (
    <Toast delay={5000} onClose={onClose}>
      <ToastHeader className={styles.reconnectHeader} onClose={onClose}>
        <strong className={styles.title}>Reconnect</strong>
      </ToastHeader>
      <ToastBody>
        <p className={styles.message}>Reconnecting... (trials {reconnectingTrials.value})</p>
      </ToastBody>
    </Toast>
  );
}

function Alert(props: AlertMessage) {
  const onClose = (): void => {
    deleteAlertMessage(props.timestamp);
  };
  const bgClassName = props.type === "error" ? styles.errorHeader : styles.infoHeader;
  return (
    <Toast autohide delay={5000} onClose={onClose}>
      <ToastHeader className={`${styles.alertHeader} ${bgClassName}`} onClose={onClose}>
        <strong className={styles.title}>{props.title}</strong>
        <span className={styles.timestamp}>{formatUnixtime(props.timestamp)}</span>
      </ToastHeader>
      <ToastBody>
        <p className={styles.message}>{props.message}</p>
      </ToastBody>
    </Toast>
  );
}

export function AlertMessages() {
  return (
    <div className={styles.container}>
      {reconnecting.value ? <Reconnect /> : null}
      {alertMessages.value.map((alertMessage) => (
        <Alert key={alertMessage.timestamp} {...alertMessage} />
      ))}
    </div>
  );
}
