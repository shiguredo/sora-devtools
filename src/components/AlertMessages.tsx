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
    <Toast delay={5000} onClose={onClose}>
      <ToastHeader className="bg-bs-yellow text-bs-dark" onClose={onClose}>
        <strong className="me-auto">Reconnect</strong>
      </ToastHeader>
      <ToastBody>
        <p className="break-words mb-0">Reconnecting... (trials {reconnectingTrials.value})</p>
      </ToastBody>
    </Toast>
  );
}

function Alert(props: AlertMessage) {
  const onClose = (): void => {
    deleteAlertMessage(props.timestamp);
  };
  const bgClassName = props.type === "error" ? "bg-bs-red" : "bg-bs-primary";
  return (
    <Toast autohide={true} delay={5000} onClose={onClose}>
      <ToastHeader className={`${bgClassName} text-white`} onClose={onClose}>
        <strong className="me-auto">{props.title}</strong>
        <span className="text-sm opacity-80">{formatUnixtime(props.timestamp)}</span>
      </ToastHeader>
      <ToastBody>
        <p className="break-words mb-0">{props.message}</p>
      </ToastBody>
    </Toast>
  );
}

export function AlertMessages() {
  return (
    <div className="absolute top-[50px] right-5 z-[1001]">
      {reconnecting.value ? <Reconnect /> : null}
      {alertMessages.value.map((alertMessage) => {
        return <Alert key={alertMessage.timestamp} {...alertMessage} />;
      })}
    </div>
  );
}
