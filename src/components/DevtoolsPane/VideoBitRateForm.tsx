import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'

import { setVideoBitRate } from '@/app/actions'
import { $connectionStatus, $videoBitRate } from '@/app/store'
import { VIDEO_BIT_RATES } from '@/constants'
import { isFormDisabled } from '@/utils'

import { DropdownInput } from './DropdownInput.tsx'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

// 15000 を超える場合にサポート外であることを表示するためのカスタム
const DISPLAY_VIDEO_BIT_RATE: string[] = VIDEO_BIT_RATES.slice()
DISPLAY_VIDEO_BIT_RATE.splice(VIDEO_BIT_RATES.indexOf('15000') + 1, 0, 'support-message')

const dropdownItemLabel = (value: string) => {
  if (value === 'support-message') {
    return '以下はサポート外です'
  }
  return value === '' ? '未指定' : value
}

export const VideoBitRateForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setVideoBitRate(event.currentTarget.value)
  }
  const items = DISPLAY_VIDEO_BIT_RATE.map((value) => ({
    label: dropdownItemLabel(value),
    value,
    disabled: value === 'support-message',
  }))
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="videoBitRate">videoBitRate:</TooltipFormLabel>
      <DropdownInput
        inputClassName="form-video-bit-rate"
        inputValue={$videoBitRate.value}
        inputPlaceholder="未指定"
        inputDisabled={disabled}
        onInputChange={onChange}
        dropdownDisabled={disabled}
        items={items}
        onItemClick={setVideoBitRate}
      />
    </div>
  )
}
