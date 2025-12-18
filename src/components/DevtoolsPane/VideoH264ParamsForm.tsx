import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setEnabledVideoH264Params, setVideoH264Params } from '@/app/actions'
import { $connectionStatus, $enabledVideoH264Params, $videoH264Params } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoH264ParamsForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledVideoH264Params(event.currentTarget.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="videoH264Params"
              checked={$enabledVideoH264Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH264Params
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledVideoH264Params.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="videoH264Params"
              placeholder="videoH264Paramsを指定"
              value={$videoH264Params.value}
              setValue={(value) => setVideoH264Params(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
