import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledVideoH264Params, setVideoH264Params } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoH264ParamsForm: React.FC = () => {
  const enabledVideoH264Params = useAppSelector((state) => state.enabledVideoH264Params)
  const videoH264Params = useAppSelector((state) => state.videoH264Params)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledVideoH264Params(event.target.checked))
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
            <JSONInputField
              controlId="videoH264Params"
              placeholder="videoH264Paramsを指定"
              value={videoH264Params}
              setValue={(value) => dispatch(setVideoH264Params(value))}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
