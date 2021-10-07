import React from "react";
import { Toast } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { deleteAlertMessage } from "@/app/slice";
import type { AlertMessage } from "@/types";

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
      </Toast.Header>
      <Toast.Body className="bg-light">
        <p className="text-break font-weight-bold mb-0">{props.message}</p>
      </Toast.Body>
    </Toast>
  );
};

export const AlertMessages: React.FC = () => {
  const alertMessages = useAppSelector((state) => state.alertMessages);
  return (
    <div className="alert-messages">
      {alertMessages.map((alertMessage) => {
        return <Alert key={alertMessage.timestamp} {...alertMessage} />;
      })}
    </div>
  );
};
