import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setEnabledVideoAV1Params, setVideoAV1Params } from '@/app/actions'
import { $connectionStatus, $enabledVideoAV1Params, $videoAV1Params } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoAV1ParamsForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledVideoAV1Params(event.currentTarget.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="videoAV1Params"
              checked={$enabledVideoAV1Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoAV1Params
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledVideoAV1Params.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="videoAV1Params"
              placeholder="videoAV1Paramsを指定"
              value={$videoAV1Params.value}
              setValue={(value) => setVideoAV1Params(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
