import type React from 'react'

import {
  setDataChannelSignaling,
  setEnabledDataChannel,
  setIgnoreDisconnectWebSocket,
} from '@/app/actions'
import {
  $connectionStatus,
  $dataChannelSignaling,
  $enabledDataChannel,
  $ignoreDisconnectWebSocket,
} from '@/app/store'
import { DATA_CHANNEL_SIGNALING, IGNORE_DISCONNECT_WEBSOCKET } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

const IgnoreDisconnectWebSocketForm: React.FC<{ disabled: boolean }> = (props) => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, IGNORE_DISCONNECT_WEBSOCKET)) {
      setIgnoreDisconnectWebSocket(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="ignoreDisconnectWebSocket">
        ignoreDisconnectWebSocket:
      </TooltipFormLabel>
      <select
        className="form-select"
        name="ignoreDisconnectWebSocket"
        value={$ignoreDisconnectWebSocket.value}
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
      </select>
    </div>
  )
}

const DataChannelSignalingForm: React.FC<{ disabled: boolean }> = (props) => {
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, DATA_CHANNEL_SIGNALING)) {
      setDataChannelSignaling(event.target.value)
    }
  }
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="dataChannelSignaling">dataChannelSignaling:</TooltipFormLabel>
      <select
        className="form-select"
        name="dataChannelSignaling"
        value={$dataChannelSignaling.value}
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
      </select>
    </div>
  )
}

export const DataChannelForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledDataChannel(event.target.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline">
            <div className="form-check form-switch">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="enabledDataChannel"
                checked={$enabledDataChannel.value}
                onChange={onChangeSwitch}
                disabled={disabled}
                aria-checked={$enabledDataChannel.value}
              />
              <label className="form-check-label" htmlFor="enabledDataChannel">
                dataChannel
              </label>
            </div>
          </div>
        </div>
      </div>
      {$enabledDataChannel.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <div className="row">
              <div className="col-auto">
                <DataChannelSignalingForm disabled={disabled} />
              </div>
              <div className="col-auto">
                <IgnoreDisconnectWebSocketForm disabled={disabled} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}
