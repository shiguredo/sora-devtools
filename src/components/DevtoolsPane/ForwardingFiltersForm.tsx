import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledForwardingFilters, setForwardingFilters } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFiltersForm: React.FC = () => {
  const enabledForwardingFilters = useSoraDevtoolsStore((state) => state.enabledForwardingFilters)
  const forwardingFilters = useSoraDevtoolsStore((state) => state.forwardingFilters)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
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
              checked={enabledForwardingFilters}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              forwardingFilters
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledForwardingFilters ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="forwardingFilters"
              placeholder="forwardingFiltersを指定"
              value={forwardingFilters}
              setValue={(value) => setForwardingFilters(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
