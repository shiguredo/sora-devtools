import type React from 'react'

import { setEnabledMetadata, setMetadata } from '@/app/actions'
import { $connectionStatus, $enabledMetadata, $metadata } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MetadataForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledMetadata(event.target.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="metadata"
              checked={$enabledMetadata.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              metadata
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledMetadata.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="metadata"
              placeholder="Metadataを指定"
              value={$metadata.value}
              setValue={(value) => setMetadata(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
