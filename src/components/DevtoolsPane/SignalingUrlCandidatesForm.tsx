import type React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const SignalingUrlCandidatesForm: React.FC = () => {
  const enabledSignalingUrlCandidates = useSoraDevtoolsStore(
    (state) => state.enabledSignalingUrlCandidates,
  )
  const signalingUrlCandidates = useSoraDevtoolsStore((state) => state.signalingUrlCandidates)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
    const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledSignalingUrlCandidates(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setSignalingUrlCandidates(event.target.value.split('\n'))
  }
  const textareaPlaceholder = `signalingUrlCandidatesを指定
(例)
wss://sora0.example.com/signaling
wss://sora1.example.com/signaling
`
  return (
    <>
      <Row className="form-row" xs="auto">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledSignalingUrlCandidates">
            <TooltipFormCheck
              kind="signalingUrlCandidates"
              checked={enabledSignalingUrlCandidates}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingUrlCandidates
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledSignalingUrlCandidates ? (
        <Row className="form-row" xs="auto">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="signalingNotifyMetadata">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder={textareaPlaceholder}
                value={signalingUrlCandidates.join('\n')}
                onChange={onChangeText}
                rows={5}
                cols={100}
                disabled={disabled}
              />
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  )
}
