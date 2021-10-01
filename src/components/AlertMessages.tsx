import React from "react";
import { Toast } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { deleteAlertMessage, SoraDemoState } from "@/app/slice";
import { AlertMessage } from "@/utils";

const Alert: React.FC<AlertMessage> = (props) => {
  const dispatch = useDispatch();
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
  const { alertMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <div className="alert-messages">
      {alertMessages.map((alertMessage) => {
        return <Alert key={alertMessage.timestamp} {...alertMessage} />;
      })}
    </div>
  );
};
