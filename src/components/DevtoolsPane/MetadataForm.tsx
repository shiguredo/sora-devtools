import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setEnabledMetadata, setMetadata } from '@/app/actions'
import { $connectionStatus, $enabledMetadata, $metadata } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const MetadataForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledMetadata(event.currentTarget.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="flex-none pr-4 pb-2">
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
          <div className="flex-none pr-4 pb-2">
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
