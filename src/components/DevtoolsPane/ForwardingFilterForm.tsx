import React from "react";
import { Col, FormControl, FormGroup, Row } from "react-bootstrap";

import { setEnabledForwardingFilter, setForwardingFilter } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck";

export const ForwardingFilterForm: React.FC = () => {
  const enabledForwardingFilter = useAppSelector((state) => state.enabledForwardingFilter);
  const forwardingFilter = useAppSelector((state) => state.forwardingFilter);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledForwardingFilter(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setForwardingFilter(event.target.value));
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledForwardingFilter">
            <TooltipFormCheck
              kind="forwardingFilter"
              checked={enabledForwardingFilter}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilter
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledForwardingFilter ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="forwardingFilter">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder="forwardingFilterを指定"
                value={forwardingFilter}
                onChange={onChangeText}
                rows={10}
                cols={100}
                disabled={disabled}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  );
};
