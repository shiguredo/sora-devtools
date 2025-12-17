import type React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setAudioStreamingLanguageCode, setEnabledAudioStreamingLanguageCode } from '@/app/actions'
import {
  $audioStreamingLanguageCode,
  $connectionStatus,
  $enabledAudioStreamingLanguageCode,
} from '@/app/store'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioStreamingLanguageCodeForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledAudioStreamingLanguageCode(event.target.checked)
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioStreamingLanguageCode(event.target.value)
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledAudioStreamingLanguageCode">
            <TooltipFormCheck
              kind="audioStreamingLanguageCode"
              checked={$enabledAudioStreamingLanguageCode.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              audioStreamingLanguageCode
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {$enabledAudioStreamingLanguageCode.value ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="audioStreamingLanguageCode">
              <FormControl
                className="flex-fill w-500"
                type="text"
                placeholder="audioStreamingLanguageCodeを指定"
                value={$audioStreamingLanguageCode.value}
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
