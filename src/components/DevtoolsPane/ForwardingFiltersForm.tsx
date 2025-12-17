import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledForwardingFilters, setForwardingFilters } from '@/app/actions'
import { $connectionStatus, $enabledForwardingFilters, $forwardingFilters } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFiltersForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledForwardingFilters(event.target.checked)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledForwardingFilters">
            <TooltipFormCheck
              kind="forwardingFilters"
              checked={$enabledForwardingFilters.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilters
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {$enabledForwardingFilters.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="forwardingFilters"
              placeholder="forwardingFiltersを指定"
              value={$forwardingFilters.value}
              setValue={(value) => setForwardingFilters(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
