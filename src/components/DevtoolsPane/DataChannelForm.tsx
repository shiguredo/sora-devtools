import type React from 'react'
import { Col, FormCheck, FormGroup, FormSelect, Row } from 'react-bootstrap'

import {
  setDataChannelSignaling,
  setEnabledDataChannel,
  setIgnoreDisconnectWebSocket,
} from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { DATA_CHANNEL_SIGNALING, IGNORE_DISCONNECT_WEBSOCKET } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

const IgnoreDisconnectWebSocketForm: React.FC<{ disabled: boolean }> = (props) => {
  const ignoreDisconnectWebSocket = useAppSelector((state) => state.ignoreDisconnectWebSocket)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, IGNORE_DISCONNECT_WEBSOCKET)) {
      dispatch(setIgnoreDisconnectWebSocket(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="ignoreDisconnectWebSocket">
      <TooltipFormLabel kind="ignoreDisconnectWebSocket">
        ignoreDisconnectWebSocket:
      </TooltipFormLabel>
      <FormSelect
        name="ignoreDisconnectWebSocket"
        value={ignoreDisconnectWebSocket}
        onChange={onChange}
        disabled={props.disabled}
      >
        {IGNORE_DISCONNECT_WEBSOCKET.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}

const DataChannelSignalingForm: React.FC<{ disabled: boolean }> = (props) => {
  const dataChannelSignaling = useAppSelector((state) => state.dataChannelSignaling)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, DATA_CHANNEL_SIGNALING)) {
      dispatch(setDataChannelSignaling(event.target.value))
    }
  }
  return (
    <FormGroup className="form-inline" controlId="dataChannelSignaling">
      <TooltipFormLabel kind="dataChannelSignaling">dataChannelSignaling:</TooltipFormLabel>
      <FormSelect
        name="dataChannelSignaling"
        value={dataChannelSignaling}
        onChange={onChange}
        disabled={props.disabled}
      >
        {DATA_CHANNEL_SIGNALING.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          )
        })}
      </FormSelect>
    </FormGroup>
  )
}

export const DataChannelForm: React.FC = () => {
  const enabledDataChannel = useAppSelector((state) => state.enabledDataChannel)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledDataChannel(event.target.checked))
  }
  return (
    <>
      <Row className="form-row">
        <Col className="col-auto">
          <FormGroup className="form-inline" controlId="enabledDataChannel">
            <FormCheck
              type="switch"
              name="enabledDataChannel"
              label="dataChannel"
              checked={enabledDataChannel}
              onChange={onChangeSwitch}
              disabled={disabled}
            />
          </FormGroup>
        </Col>
      </Row>
      {enabledDataChannel ? (
        <Row className="form-row">
          <Col className="col-auto">
            <Row xs="auto">
              <Col>
                <DataChannelSignalingForm disabled={disabled} />
              </Col>
              <Col>
                <IgnoreDisconnectWebSocketForm disabled={disabled} />
              </Col>
            </Row>
          </Col>
        </Row>
      ) : null}
    </>
  )
}
