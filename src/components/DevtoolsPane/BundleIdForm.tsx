import type React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setBundleId, setEnabledBundleId } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck'

export const BundleIdForm: React.FC = () => {
  const enabledBundleId = useAppSelector((state) => state.enabledBundleId)
  const bundleId = useAppSelector((state) => state.bundleId)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledBundleId(event.target.checked))
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setBundleId(event.target.value))
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledBundleId">
            <TooltipFormCheck
              kind="bundleId"
              checked={enabledBundleId}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              bundleId
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledBundleId ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="bundleId">
              <FormControl
                className="flex-fill w-500"
                type="text"
                placeholder="bundleIdを指定"
                value={bundleId}
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
