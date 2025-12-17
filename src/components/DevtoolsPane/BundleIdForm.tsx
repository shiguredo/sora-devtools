import type React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setBundleId, setEnabledBundleId } from '@/app/actions'
import { $bundleId, $connectionStatus, $enabledBundleId } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const BundleIdForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledBundleId(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setBundleId(event.target.value)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledBundleId">
            <TooltipFormCheck
              kind="bundleId"
              checked={$enabledBundleId.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              bundleId
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {$enabledBundleId.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="bundleId">
              <FormControl
                className="flex-fill w-500"
                type="text"
                placeholder="bundleIdを指定"
                value={$bundleId.value}
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
