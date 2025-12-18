import type React from 'react'

import { setDataChannels, setEnabledDataChannels } from '@/app/actions'
import { $connectionStatus, $dataChannels, $enabledDataChannels } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const DataChannelsForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
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
    setEnabledDataChannels(event.target.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="col-auto">
          <div className="form-inline form-switch">
            <TooltipFormCheck
              kind="dataChannels"
              checked={$enabledDataChannels.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              dataChannels
            </TooltipFormCheck>
          </div>
        </div>
      </div>
      {$enabledDataChannels.value ? (
        <div className="row form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="dataChannels"
              placeholder={textareaPlaceholder}
              value={$dataChannels.value}
              setValue={(value) => setDataChannels(value)}
              disabled={disabled}
              rows={12}
              extraControls={
                <button
                  type="button"
                  className="btn btn-light btn-sm"
                  onClick={() => setDataChannels(exampleJsonString)}
                >
                  load template
                </button>
              }
            />
          </div>
        </div>
      ) : null}
    </>
  )
}
