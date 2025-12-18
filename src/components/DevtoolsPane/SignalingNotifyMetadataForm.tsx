import type React from 'react'

import { setEnabledSignalingNotifyMetadata, setSignalingNotifyMetadata } from '@/app/actions'
import {
  $connectionStatus,
  $enabledSignalingNotifyMetadata,
  $signalingNotifyMetadata,
} from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const SignalingNotifyMetadataForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledSignalingNotifyMetadata(event.target.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="signalingNotifyMetadata"
              checked={$enabledSignalingNotifyMetadata.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              signalingNotifyMetadata
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledSignalingNotifyMetadata.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="signalingNotifyMetadata"
              placeholder="signalingNotifyMetadataを指定"
              value={$signalingNotifyMetadata.value}
              setValue={(value) => setSignalingNotifyMetadata(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
