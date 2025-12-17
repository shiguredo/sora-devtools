import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { $connectionStatus, $forceStereoOutput, setForceStereoOutput } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForceStereoOutputForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setForceStereoOutput(event.target.checked)
  }
  return (
    <Row className="form-row">
      <Col className="col-auto">
        <FormGroup className="form-inline" controlId="forceStereoOutput">
          <TooltipFormCheck
            kind="forceStereoOutput"
            checked={$forceStereoOutput.value}
            onChange={onChangeSwitch}
            disabled={disabled}
          >
            forceStereoOutput
          </TooltipFormCheck>
        </FormGroup>
      </Col>
    </Row>
  )
}
