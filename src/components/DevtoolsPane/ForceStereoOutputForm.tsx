import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setForceStereoOutput, useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForceStereoOutputForm: React.FC = () => {
  const forceStereoOutput = useSoraDevtoolsStore((state) => state.forceStereoOutput)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setForceStereoOutput(event.target.checked)
  }
  return (
    <Row className="form-row">
      <Col className="col-auto">
        <FormGroup className="form-inline" controlId="forceStereoOutput">
          <TooltipFormCheck
            kind="forceStereoOutput"
            checked={forceStereoOutput}
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
