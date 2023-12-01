import React from 'react'
import { Button, Col, FormControl, FormGroup, Row } from 'react-bootstrap'

import { setDataChannels, setEnabledDataChannels } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormCheck } from './TooltipFormCheck'

export const DataChannelsForm: React.FC = () => {
  const enabledDataChannels = useAppSelector((state) => state.enabledDataChannels)
  const dataChannels = useAppSelector((state) => state.dataChannels)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const exampleJsonString = JSON.stringify(
    [
      {
        label: '#sora-devtools',
        maxPacketLifeTime: 10,
        ordered: true,
        compress: false,
        direction: 'sendrecv',
      },
    ],
    null,
    2,
  )
  const textareaPlaceholder = `dataChannelsを指定\n(例)\n${exampleJsonString}`
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledDataChannels(event.target.checked))
  }
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDataChannels(event.target.value))
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledDataChannels">
            <TooltipFormCheck
              kind="dataChannels"
              checked={enabledDataChannels}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              dataChannels
            </TooltipFormCheck>
          </FormGroup>
        </Col>
      </Row>
      {enabledDataChannels ? (
        <Row className="form-row">
          <Col className="col-auto">
            <FormGroup className="form-inline position-relative" controlId="dataChannels">
              <FormControl
                className="flex-fill"
                as="textarea"
                placeholder={textareaPlaceholder}
                value={dataChannels}
                onChange={onChangeText}
                rows={12}
                cols={100}
                disabled={disabled}
              />
              <Button
                className="btn-load-template"
                type="button"
                variant="outline-secondary"
                size="sm"
                onClick={() => dispatch(setDataChannels(exampleJsonString))}
              >
                load template
              </Button>
            </FormGroup>
          </Col>
        </Row>
      ) : null}
    </>
  )
}
