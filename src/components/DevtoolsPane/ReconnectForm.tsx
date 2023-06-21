import React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setReconnect } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck'

export const ReconnectForm: React.FC = () => {
  const reconnect = useAppSelector((state) => state.reconnect)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setReconnect(event.target.checked))
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
