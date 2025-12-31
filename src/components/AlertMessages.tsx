import { useEffect } from "preact/hooks";

import { deleteAlertMessage, reconnectSora, setSoraReconnecting } from "@/app/actions";
import { alertMessages, reconnecting, reconnectingTrials } from "@/app/signals";
import { Toast, ToastBody, ToastHeader } from "@/components/ui";
import type { AlertMessage } from "@/types";
import { formatUnixtime } from "@/utils";

function Reconnect() {
  const onClose = (): void => {
    setSoraReconnecting(false);
  };
  useEffect(() => {
    void reconnectSora();
  }, []);
  return (
    <Toast delay={20000} onClose={onClose}>
      <ToastHeader className={"bg-warning text-white"} onClose={onClose}>
        <strong className="me-auto">Reconnect</strong>
      </ToastHeader>
      <ToastBody className="bg-light">
        <p className="text-break font-weight-bold mb-0">
          Reconnecting... (trials {reconnectingTrials.value})
        </p>
      </ToastBody>
    </Toast>
  );
}

function Alert(props: AlertMessage) {
  const onClose = (): void => {
    deleteAlertMessage(props.timestamp);
  };
  const bgClassName = props.type === "error" ? "bg-danger" : "bg-info";
  return (
    <Toast autohide={true} delay={20000} onClose={onClose}>
      <ToastHeader className={`${bgClassName} text-white`} onClose={onClose}>
        <strong className="me-auto">{props.title}</strong>
        <span>{formatUnixtime(props.timestamp)}</span>
      </ToastHeader>
      <ToastBody className="bg-light">
        <p className="text-break font-weight-bold mb-0">{props.message}</p>
      </ToastBody>
    </Toast>
  );
}

export function AlertMessages() {
  return (
    <div className="alert-messages">
      {reconnecting.value ? <Reconnect /> : null}
      {alertMessages.value.map((alertMessage) => {
        return <Alert key={alertMessage.timestamp} {...alertMessage} />;
      })}
    </div>
  );
}
