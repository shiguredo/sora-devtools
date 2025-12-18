import type { FunctionComponent } from 'preact'

import { setEnabledVideoH265Params, setVideoH265Params } from '@/app/actions'
import { $connectionStatus, $enabledVideoH265Params, $videoH265Params } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoH265ParamsForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement
    setEnabledVideoH265Params(target.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="videoH265Params"
              checked={$enabledVideoH265Params.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH265Params
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledVideoH265Params.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="videoH265Params"
              placeholder="videoH265Paramsを指定"
              value={$videoH265Params.value}
              setValue={(value) => setVideoH265Params(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
