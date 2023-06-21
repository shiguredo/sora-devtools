import React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setClientId, setEnabledClientId } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck'

export const ClientIdForm: React.FC = () => {
  const enabledClientId = useAppSelector((state) => state.enabledClientId)
  const clientId = useAppSelector((state) => state.clientId)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledClientId(event.target.checked))
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setClientId(event.target.value))
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledClientId">
            <TooltipFormCheck
              kind="clientId"
              checked={enabledClientId}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              clientId
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledClientId ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="clientId">
              <FormControl
                className="flex-fill w-500"
                type="text"
                placeholder="ClientIdを指定"
                value={clientId}
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
