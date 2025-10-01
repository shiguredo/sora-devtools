import type React from 'react'

import { setEnabledVideoH265Params, setVideoH265Params } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const VideoH265ParamsForm: React.FC = () => {
  const enabledVideoH265Params = useSoraDevtoolsStore((state) => state.enabledVideoH265Params)
  const videoH265Params = useSoraDevtoolsStore((state) => state.videoH265Params)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setEnabledVideoH265Params(event.target.checked)
  }
  return (
    <>
      <div className="form-row">
        <div>
          <div className="flex items-center">
            <TooltipFormCheck
              kind="videoH265Params"
              checked={enabledVideoH265Params}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              videoH265Params
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {enabledVideoH265Params ? (
        <div className="form-row">
          <div>
            <JSONInputField
              controlId="videoH265Params"
              placeholder="videoH265Paramsを指定"
              value={videoH265Params}
              setValue={(value) => setVideoH265Params(value)}
              disabled={disabled}
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
