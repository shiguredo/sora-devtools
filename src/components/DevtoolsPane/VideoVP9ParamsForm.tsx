import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledVideoVP9Params, setVideoVP9Params } from '@/app/actions'
import { $connectionStatus, $enabledVideoVP9Params, $videoVP9Params } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoVP9ParamsForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledVideoVP9Params(event.target.checked)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledVideoVP9Params">
            <TooltipFormCheck
              kind="videoVP9Params"
              checked={$enabledVideoVP9Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoVP9Params
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {$enabledVideoVP9Params.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="videoVP9Params"
              placeholder="videoVP9Paramsを指定"
              value={$videoVP9Params.value}
              setValue={(value) => setVideoVP9Params(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
