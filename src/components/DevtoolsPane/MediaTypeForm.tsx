import type React from 'react'
import { useEffect, useState } from 'react'

import { setMediaType } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
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
    <label className="inline-flex items-center mr-4 cursor-pointer">
      <input
        type="radio"
        id={label}
        value={label}
        checked={mediaType === label}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed"
      />
      <span className="ml-2 text-base">{label}</span>
    </label>
  )
}

export const MediaTypeForm: React.FC = () => {
  // NOTE(yuito): window.CropTarget の有無のみで radio の表示/非表示を切り替えると
  // サーバサイドとクライアントサイドのレンダリング結果の不一致で warning が発生するため
  // mount してから表示するハックを入れる
  const [mountClient, setMountClient] = useState(false)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)
  const localMediaStream = useSoraDevtoolsStore((state) => state.soraContents.localMediaStream)
  const mediaType = useSoraDevtoolsStore((state) => state.mediaType)
  const disabled = localMediaStream !== null || isFormDisabled(connectionStatus)
  const enabledMp4Media = Mp4MediaStream.isSupported()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (checkFormValue(event.target.value, MEDIA_TYPES)) {
      setMediaType(event.target.value)
    }
  }
  useEffect(() => {
    setMountClient(true)
  }, [])
  return (
    <div className="flex items-center flex-wrap">
      <TooltipFormLabel kind="mediaType">mediaType:</TooltipFormLabel>
      <FormRadio
        label="getUserMedia"
        mediaType={mediaType}
        disabled={disabled}
        onChange={onChange}
      />
      <FormRadio
        label="getDisplayMedia"
        mediaType={mediaType}
        disabled={disabled}
        onChange={onChange}
      />
      <FormRadio label="fakeMedia" mediaType={mediaType} disabled={disabled} onChange={onChange} />
      {mountClient && (
        <FormRadio
          label="mp4Media"
          mediaType={mediaType}
          disabled={disabled || !enabledMp4Media}
          onChange={onChange}
        />
      )}
    </div>
  )
}
