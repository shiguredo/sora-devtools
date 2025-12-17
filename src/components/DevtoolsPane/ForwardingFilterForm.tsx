import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledForwardingFilter, setForwardingFilter } from '@/app/actions'
import { $connectionStatus, $enabledForwardingFilter, $forwardingFilter } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFilterForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledForwardingFilter(event.target.checked)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledForwardingFilter">
            <TooltipFormCheck
              kind="forwardingFilter"
              checked={$enabledForwardingFilter.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilter
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {$enabledForwardingFilter.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="forwardingFilter"
              placeholder="forwardingFilterを指定"
              value={$forwardingFilter.value}
              setValue={(value) => setForwardingFilter(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
