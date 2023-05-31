import React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setEnabledVideoH264Params, setVideoH264Params } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck'

export const VideoH264ParamsForm: React.FC = () => {
  const enabledVideoH264Params = useAppSelector((state) => state.enabledVideoH264Params)
  const videoH264Params = useAppSelector((state) => state.videoH264Params)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledVideoH264Params(event.target.checked))
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideoH264Params(event.target.value))
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledVideoH264Params">
            <TooltipFormCheck
              kind="videoH264Params"
              checked={enabledVideoH264Params}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH264Params
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledVideoH264Params ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="videoH264Params">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder="videoH264Paramsを指定"
                value={videoH264Params}
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
  )
}
