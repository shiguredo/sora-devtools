import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledMetadata, setMetadata } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MetadataForm: React.FC = () => {
  const enabledMetadata = useSoraDevtoolsStore((state) => state.enabledMetadata)
  const metadata = useSoraDevtoolsStore((state) => state.metadata)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledMetadata(event.target.checked)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledMetadata">
            <TooltipFormCheck
              kind="metadata"
              checked={enabledMetadata}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              metadata
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledMetadata ? (
        <Row className="form-row">
          <Col className="col-auto">
            <JSONInputField
              controlId="metadata"
              placeholder="Metadataを指定"
              value={metadata}
              setValue={(value) => setMetadata(value)}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
