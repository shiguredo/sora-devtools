import type React from 'react'

import { setAudioBitRate } from '@/app/actions'
import { $audioBitRate, $connectionStatus } from '@/app/store'
import { AUDIO_BIT_RATES } from '@/constants'
import { isFormDisabled } from '@/utils'

import { DropdownInput } from './DropdownInput.tsx'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const AudioBitRateForm: React.FC = () => {
  const disabled = isFormDisabled($connectionStatus.value)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setAudioBitRate(event.target.value)
  }
  const items = AUDIO_BIT_RATES.map((value) => ({
    label: value === '' ? '未指定' : value,
    value,
  }))
  return (
    <div className="form-inline">
      <TooltipFormLabel kind="audioBitRate">audioBitRate:</TooltipFormLabel>
      <DropdownInput
        inputClassName="form-audio-bit-rate"
        inputValue={$audioBitRate.value}
        inputPlaceholder="未指定"
        inputDisabled={disabled}
        onInputChange={onChange}
        dropdownDisabled={disabled}
        items={items}
        onItemClick={setAudioBitRate}
      />
    </div>
  )
}
