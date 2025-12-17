import type React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setClientId, setEnabledClientId } from '@/app/actions'
import { $clientId, $connectionStatus, $enabledClientId } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ClientIdForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledClientId(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setClientId(event.target.value)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledClientId">
            <TooltipFormCheck
              kind="clientId"
              checked={$enabledClientId.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              clientId
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {$enabledClientId.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="clientId">
              <FormControl
                className="flex-fill w-500"
                type="text"
                placeholder="ClientIdを指定"
                value={$clientId.value}
                onChange={onChangeText}
                disabled={disabled}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  )
}
