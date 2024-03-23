import type React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setEnabledVideoH265Params, setVideoH265Params } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck'

export const VideoH265ParamsForm: React.FC = () => {
  const enabledVideoH265Params = useAppSelector((state) => state.enabledVideoH265Params)
  const videoH265Params = useAppSelector((state) => state.videoH265Params)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledVideoH265Params(event.target.checked))
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setVideoH265Params(event.target.value))
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledVideoH265Params">
            <TooltipFormCheck
              kind="videoH265Params"
              checked={enabledVideoH265Params}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH265Params
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledVideoH265Params ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="videoH265Params">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder="videoH265Paramsを指定"
                value={videoH265Params}
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
