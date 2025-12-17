import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setReconnect } from '@/app/actions'
import { $connectionStatus, $reconnect } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ReconnectForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setReconnect(event.target.checked)
  }
  return (
    <Row className="form-row">
      <Col className="col-auto">
        <FormGroup className="form-inline" controlId="reconnect">
          <TooltipFormCheck
            kind="reconnect"
            checked={$reconnect.value}
            onChange={onChange}
            disabled={disabled}
          >
            reconnect
          </TooltipFormCheck>
        </FormGroup>
      </Col>
    </Row>
  )
}
