import type React from 'react'
import { Button, Col, FormGroup, Row } from 'react-bootstrap'

import { setDataChannels, setEnabledDataChannels } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const DataChannelsForm: React.FC = () => {
  const enabledDataChannels = useAppSelector((state) => state.enabledDataChannels)
  const dataChannels = useAppSelector((state) => state.dataChannels)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const exampleJsonString = JSON.stringify(
    [
      {
        label: '#devtools',
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
            <JSONInputField
              controlId="dataChannels"
              placeholder={textareaPlaceholder}
              value={dataChannels}
              setValue={(value) => dispatch(setDataChannels(value))}
              disabled={disabled}
              rows={12}
              extraControls={
                <Button
                  type="button"
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => dispatch(setDataChannels(exampleJsonString))}
                >
                  load template
                </Button>
              }
            />
          </Col>
        </Row>
      ) : null}
    </>
  )
}
