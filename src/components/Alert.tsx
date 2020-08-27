import React from "react";
import { Alert as BootstrapAlert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { setErrorMessage, SoraDemoState } from "@/slice";

const Alert: React.FC = () => {
  const { errorMessage } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  if (errorMessage === null) {
    return null;
  }
  const onClose = (): void => {
    dispatch(setErrorMessage(null));
  };
  return (
    <BootstrapAlert variant="danger" onClose={onClose} dismissible>
      {errorMessage}
    </BootstrapAlert>
  );
};

export default Alert;
