import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledVideoAV1Params, setVideoAV1Params } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoAV1ParamsForm: React.FC = () => {
  const enabledVideoAV1Params = useAppSelector((state) => state.enabledVideoAV1Params)
  const videoAV1Params = useAppSelector((state) => state.videoAV1Params)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledVideoAV1Params(event.target.checked))
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledVideoAV1Params">
            <TooltipFormCheck
              kind="videoAV1Params"
              checked={enabledVideoAV1Params}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoAV1Params
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledVideoAV1Params ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="videoAV1Params"
              placeholder="videoAV1Paramsを指定"
              value={videoAV1Params}
              setValue={(value) => dispatch(setVideoAV1Params(value))}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
