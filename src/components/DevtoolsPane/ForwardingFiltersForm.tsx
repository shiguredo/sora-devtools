import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledForwardingFilters, setForwardingFilters } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForwardingFiltersForm: React.FC = () => {
  const enabledForwardingFilters = useAppSelector((state) => state.enabledForwardingFilters)
  const forwardingFilters = useAppSelector((state) => state.forwardingFilters)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledForwardingFilters(event.target.checked))
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
              setValue={(value) => dispatch(setForwardingFilters(value))}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
