import type React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { useStore } from '@/app/store2'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const BundleIdForm: React.FC = () => {
  const enabledBundleId = useStore((state) => state.enabledBundleId)
  const bundleId = useStore((state) => state.bundleId)
  const connectionStatus = useStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const setEnabledBundleId = useStore((state) => state.setEnabledBundleId)
  const setBundleId = useStore((state) => state.setBundleId)
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
