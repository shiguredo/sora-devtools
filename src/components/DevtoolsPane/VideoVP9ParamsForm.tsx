import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledVideoVP9Params, setVideoVP9Params } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoVP9ParamsForm: React.FC = () => {
  const enabledVideoVP9Params = useAppSelector((state) => state.enabledVideoVP9Params)
  const videoVP9Params = useAppSelector((state) => state.videoVP9Params)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledVideoVP9Params(event.target.checked))
  }
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
            <JSONInputField
              controlId="videoVP9Params"
              placeholder="videoVP9Paramsを指定"
              value={videoVP9Params}
              setValue={(value) => dispatch(setVideoVP9Params(value))}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
