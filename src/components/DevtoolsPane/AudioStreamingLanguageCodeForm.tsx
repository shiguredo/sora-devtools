import type React from 'react'
import { Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setAudioStreamingLanguageCode, setEnabledAudioStreamingLanguageCode } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const AudioStreamingLanguageCodeForm: React.FC = () => {
  const enabledAudioStreamingLanguageCode = useAppSelector(
    (state) => state.enabledAudioStreamingLanguageCode,
  )
  const audioStreamingLanguageCode = useAppSelector((state) => state.audioStreamingLanguageCode)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledAudioStreamingLanguageCode(event.target.checked))
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAudioStreamingLanguageCode(event.target.value))
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledAudioStreamingLanguageCode">
            <TooltipFormCheck
              kind="audioStreamingLanguageCode"
              checked={enabledAudioStreamingLanguageCode}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              audioStreamingLanguageCode
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledAudioStreamingLanguageCode ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline" controlId="audioStreamingLanguageCode">
              <FormControl
                className="flex-fill w-500"
                type="text"
                placeholder="audioStreamingLanguageCodeを指定"
                value={audioStreamingLanguageCode}
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
