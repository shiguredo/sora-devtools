import type React from 'react'
import { Dropdown, DropdownButton, Form, FormGroup, InputGroup } from 'react-bootstrap'

import { setVideoBitRate } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { VIDEO_BIT_RATES } from '@/constants'
import { isFormDisabled } from '@/utils'

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

export const VideoBitRateForm: React.FC = () => {
  const videoBitRate = useSoraDevtoolsStore((state) => state.videoBitRate)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const disabled = isFormDisabled(connectionStatus)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setVideoBitRate(event.target.value)
  }
  return (
    <FormGroup className="form-inline" controlId="videoBitRate">
      <TooltipFormLabel kind="videoBitRate">videoBitRate:</TooltipFormLabel>
      <InputGroup>
        <Form.Control
          className="form-video-bit-rate"
          type="text"
          value={videoBitRate}
          onChange={onChange}
          placeholder="未指定"
          disabled={disabled}
        />
        <DropdownButton
          variant="outline-secondary form-template-dropdown"
          title=""
          align="end"
          disabled={disabled}
        >
          {DISPLAY_VIDEO_BIT_RATE.map((value) => {
            return (
              <Dropdown.Item
                key={value}
                as="button"
                onClick={() => setVideoBitRate(value)}
                disabled={value === 'support-message'}
              >
                {dropdownItemLabel(value)}
              </Dropdown.Item>
            )
          })}
        </DropdownButton>
      </InputGroup>
    </FormGroup>
  )
}
