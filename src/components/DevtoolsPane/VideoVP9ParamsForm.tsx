import React from 'react';
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap';

import { setEnabledVideoVP9Params, setVideoVP9Params } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { isFormDisabled } from '@/utils';

import { TooltipFormCheck } from './TooltipFormCheck';

export const VideoVP9ParamsForm: React.FC = () => {
  const enabledVideoVP9Params = useAppSelector((state) => state.enabledVideoVP9Params);
  const videoVP9Params = useAppSelector((state) => state.videoVP9Params);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledVideoVP9Params(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideoVP9Params(event.target.value));
  };
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledVideoVP9Params">
            <TooltipFormCheck
              kind="videoVP9Params"
              checked={enabledVideoVP9Params}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoVP9Params
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledVideoVP9Params ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="videoVP9Params">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder="videoVP9Paramsを指定"
                value={videoVP9Params}
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
