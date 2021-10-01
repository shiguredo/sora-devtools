import React from "react";
import { Col, FormCheck, FormControl, FormGroup, Row } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setEnabledMetadata, setMetadata } from "@/app/slice";

export const FormMetadata: React.FC = () => {
  const enabledMetadata = useAppSelector((state) => state.enabledMetadata);
  const metadata = useAppSelector((state) => state.metadata);
  const dispatch = useAppDispatch();
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledMetadata(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setMetadata(event.target.value));
  };
  return (
    <>
      <Row className="form-row">
        <Col>
          <FormGroup className="form-inline" controlId="enabledMetadata">
            <FormCheck
              type="switch"
              name="enabledMetadata"
              label="metadata"
              checked={enabledMetadata}
              onChange={onChangeSwitch}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledMetadata ? (
        <Row>
          <Col>
            <FormGroup className="form-inline w-50" controlId="metadata">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder="Metadataを指定"
                value={metadata}
                onChange={onChangeText}
                rows={10}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  );
};
