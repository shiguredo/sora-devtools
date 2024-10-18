import type React from 'react'
import { useEffect, useState } from 'react'
import { FormCheck, FormGroup } from 'react-bootstrap'

import { setMediaType } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { MEDIA_TYPES } from '@/constants'
import { checkFormValue, isFormDisabled } from '@/utils'

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
    <FormCheck
      type="radio"
      inline={true}
      id={label}
      label={label}
      value={label}
      checked={mediaType === label}
      onChange={onChange}
      disabled={disabled}
    />
  )
}

export const MediaTypeForm: React.FC = () => {
  // NOTE(yuito): window.CropTarget の有無のみで radio の表示/非表示を切り替えると
  // サーバサイドとクライアントサイドのレンダリング結果の不一致で warning が発生するため
  // mount してから表示するハックを入れる
  const [mountClient, setMountClient] = useState(false)
  const enabledMediacaptureRegion = typeof window !== 'undefined' && window.CropTarget !== undefined
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const localMediaStream = useAppSelector((state) => state.soraContents.localMediaStream)
  const mediaType = useAppSelector((state) => state.mediaType)
  const disabled = localMediaStream !== null || isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (checkFormValue(event.target.value, MEDIA_TYPES)) {
      dispatch(setMediaType(event.target.value))
    }
  }
  useEffect(() => {
    setMountClient(true)
  }, [])
  return (
    <FormGroup className="form-inline flex-wrap">
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
          label="mediacaptureRegion"
          mediaType={mediaType}
          disabled={disabled || !enabledMediacaptureRegion}
          onChange={onChange}
        />
      )}
    </FormGroup>
  )
}
