import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setDataChannels, setEnabledDataChannels } from '@/app/actions'
import { $connectionStatus, $dataChannels, $enabledDataChannels } from '@/app/store'
import { isFormDisabled } from '@/utils'

import { JSONInputField } from './JSONInputField.tsx'
import { TooltipFormCheck } from './TooltipFormCheck.tsx'

export const DataChannelsForm: FunctionComponent = () => {
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
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledDataChannels(event.currentTarget.checked)
  }
  return (
    <>
      <div className="row form-row">
        <div className="flex-none pr-4 pb-2">
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
          <div className="flex-none pr-4 pb-2">
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
                  className="px-2 py-1 text-sm bg-gray-100 text-gray-900 hover:bg-gray-200 rounded"
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
