import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const ForceStereoOutputForm: React.FC = () => {
  const forceStereoOutput = useAppSelector((state) => state.forceStereoOutput)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch.setForceStereoOutput(event.target.checked)
  }
  return (
    <>
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
    </>
  )
}
