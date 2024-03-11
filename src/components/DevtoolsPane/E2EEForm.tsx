import type React from 'react'
import { useEffect, useState } from 'react'
import { Col, FormGroup, Row, Spinner } from 'react-bootstrap'

import { setE2EE } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck'

export const E2EEForm: React.FC = () => {
  const [displaySpinner, setDisplaySpinner] = useState(false)
  const e2ee = useAppSelector((state) => state.e2ee)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (event.target.checked) {
      setDisplaySpinner(true)
    }
    dispatch(setE2EE(event.target.checked))
  }
  useEffect(() => {
    if (e2ee) {
      setDisplaySpinner(false)
    }
  }, [e2ee])
  return (
    <Row className="form-row">
      <Col className="col-auto">
        <FormGroup className="form-inline" controlId="e2ee">
          <TooltipFormCheck kind="e2ee" checked={e2ee} onChange={onChange} disabled={disabled}>
            e2ee
          </TooltipFormCheck>
          {displaySpinner ? (
            <Spinner
              className="spinner-status"
              variant="primary"
              animation="border"
              role="status"
            />
          ) : null}
        </FormGroup>
      </Col>
    </Row>
  )
}
