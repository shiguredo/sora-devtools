import React, { useEffect } from "react";
import { Toast } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { deleteAlertMessage, reconnectSora, setSoraReconnecting } from "@/app/slice";
import type { AlertMessage } from "@/types";
import { formatUnixtime } from "@/utils";

const Reconnect: React.FC = () => {
  const dispatch = useAppDispatch();
  const reconnectingTrials = useAppSelector((state) => state.soraContents.reconnectingTrials);
  const onClose = (): void => {
    dispatch(setSoraReconnecting(false));
  };
  useEffect(() => {
    dispatch(reconnectSora());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <Toast delay={20000} onClose={onClose}>
      <Toast.Header className={`bg-warning text-white`}>
        <strong className="me-auto">Reconnect</strong>
      </Toast.Header>
      <Toast.Body className="bg-light">
        <p className="text-break font-weight-bold mb-0">Reconnecting... (trials {reconnectingTrials})</p>
      </Toast.Body>
    </Toast>
  );
};

const Alert: React.FC<AlertMessage> = (props) => {
  const dispatch = useAppDispatch();
  const onClose = (): void => {
    dispatch(deleteAlertMessage(props.timestamp));
  };
  const bgClassName = props.type === "error" ? "bg-danger" : "bg-info";
  return (
    <Toast autohide delay={20000} onClose={onClose}>
      <Toast.Header className={`${bgClassName} text-white`}>
        <strong className="me-auto">{props.title}</strong>
        <span>{formatUnixtime(props.timestamp, { millisecond: false })}</span>
      </Toast.Header>
      <Toast.Body className="bg-light">
        <p className="text-break font-weight-bold mb-0">{props.message}</p>
      </Toast.Body>
    </Toast>
  );
};

export const AlertMessages: React.FC = () => {
  const alertMessages = useAppSelector((state) => state.alertMessages);
  const reconnecting = useAppSelector((state) => state.soraContents.reconnecting);
  return (
    <div className="alert-messages">
      {reconnecting ? <Reconnect /> : null}
      {alertMessages.map((alertMessage) => {
        return <Alert key={alertMessage.timestamp} {...alertMessage} />;
      })}
    </div>
  );
};
