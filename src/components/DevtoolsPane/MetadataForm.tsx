import type React from 'react'
import { Col, FormGroup, Row } from 'react-bootstrap'

import { setEnabledMetadata, setMetadata } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MetadataForm: React.FC = () => {
  const enabledMetadata = useAppSelector((state) => state.enabledMetadata)
  const metadata = useAppSelector((state) => state.metadata)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledMetadata(event.target.checked))
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
              setValue={(value) => dispatch(setMetadata(value))}
              disabled={disabled}
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
