import { useSignal } from '@preact/signals'
import type React from 'react'
import { useEffect } from 'react'

import { setMediaType } from '@/app/actions'
import { $connectionStatus, $localMediaStream, $mediaType } from '@/app/store'
import { MEDIA_TYPES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

import { Mp4MediaStream } from '@shiguredo/mp4-media-stream'
import { TooltipFormLabel } from './TooltipFormLabel.tsx'

type FormRadioProps = {
  label: string
  mediaType: string
  disabled: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}
const FormRadio: React.FC<FormRadioProps> = (props) => {
  const { label, disabled, onChange, mediaType } = props
  return (
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="radio"
        id={label}
        value={label}
        checked={mediaType === label}
        onChange={onChange}
        disabled={disabled}
      />
      <label className="form-check-label" htmlFor={label}>
        {label}
      </label>
    </div>
  )
}

export const MediaTypeForm: React.FC = () => {
  // NOTE(yuito): window.CropTarget の有無のみで radio の表示/非表示を切り替えると
  // サーバサイドとクライアントサイドのレンダリング結果の不一致で warning が発生するため
  // mount してから表示するハックを入れる
  const mountClient = useSignal(false)
  const disabled = $localMediaStream.value !== null || isFormDisabled($connectionStatus.value)
  const enabledMp4Media = Mp4MediaStream.isSupported()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (checkFormValue(event.target.value, MEDIA_TYPES)) {
      setMediaType(event.target.value)
    }
  }
  useEffect(() => {
    mountClient.value = true
  }, [mountClient])
  return (
    <div className="form-inline flex-wrap">
      <TooltipFormLabel kind="mediaType">mediaType:</TooltipFormLabel>
      <FormRadio
        label="getUserMedia"
        mediaType={$mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      <FormRadio
        label="getDisplayMedia"
        mediaType={$mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      <FormRadio
        label="fakeMedia"
        mediaType={$mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      {mountClient.value && (
        <FormRadio
          label="mp4Media"
          mediaType={$mediaType.value}
          disabled={disabled || !enabledMp4Media}
          onChange={onChange}
        />
      )}
    </div>
  )
}
