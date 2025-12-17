import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledVideoH264Params, setVideoH264Params } from '@/app/actions'
import { $connectionStatus, $enabledVideoH264Params, $videoH264Params } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoH264ParamsForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledVideoH264Params(event.target.checked)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledVideoH264Params">
            <TooltipFormCheck
              kind="videoH264Params"
              checked={$enabledVideoH264Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH264Params
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {$enabledVideoH264Params.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="videoH264Params"
              placeholder="videoH264Paramsを指定"
              value={$videoH264Params.value}
              setValue={(value) => setVideoH264Params(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
