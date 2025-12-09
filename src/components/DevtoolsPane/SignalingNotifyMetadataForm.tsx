import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledSignalingNotifyMetadata, setSignalingNotifyMetadata } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const SignalingNotifyMetadataForm: React.FC = () => {
  const enabledSignalingNotifyMetadata = useSoraDevtoolsStore(
    (state) => state.enabledSignalingNotifyMetadata,
  )
  const signalingNotifyMetadata = useSoraDevtoolsStore((state) => state.signalingNotifyMetadata)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledSignalingNotifyMetadata(event.target.checked)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledSignalingNotifyMetadata">
            <TooltipFormCheck
              kind="signalingNotifyMetadata"
              checked={enabledSignalingNotifyMetadata}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingNotifyMetadata
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledSignalingNotifyMetadata ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="signalingNotifyMetadata"
              placeholder="signalingNotifyMetadataを指定"
              value={signalingNotifyMetadata}
              setValue={(value) => setSignalingNotifyMetadata(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
