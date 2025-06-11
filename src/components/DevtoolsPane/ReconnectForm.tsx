import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setReconnect } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ReconnectForm: React.FC = () => {
  const reconnect = useSoraDevtoolsStore((state) => state.reconnect)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setReconnect(event.target.checked)
  }
  return (
    <Row className="form-row">
      <Col className="col-auto">
        <FormGroup className="form-inline" controlId="reconnect">
          <TooltipFormCheck
            kind="reconnect"
            checked={reconnect}
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
