import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledVideoH265Params, setVideoH265Params } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoH265ParamsForm: React.FC = () => {
  const enabledVideoH265Params = useSoraDevtoolsStore((state) => state.enabledVideoH265Params)
  const videoH265Params = useSoraDevtoolsStore((state) => state.videoH265Params)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
    const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledVideoH265Params(event.target.checked)
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
            <JSONInputField
              controlId="videoH265Params"
              placeholder="videoH265Paramsを指定"
              value={videoH265Params}
              setValue={(value) => setVideoH265Params(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
