import { Mp4MediaStream } from '@shiguredo/mp4-media-stream'

import type React from 'react'
import { Form, FormGroup } from 'react-bootstrap'

import { setMp4MediaStream } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { isFormDisabled } from '@/utils'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const Mp4FileForm: React.FC = () => {
  const mediaType = useAppSelector((state) => state.mediaType)
  const localMediaStream = useAppSelector((state) => state.soraContents.localMediaStream)
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus)
  const disabled = localMediaStream !== null || isFormDisabled(connectionStatus)
  const dispatch = useAppDispatch()
  const onChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files
    if (files === null || files.length === 0) {
      return
    }

    // 以前の内容が残っていた場合に備えて事前に null を入れておく
    dispatch(setMp4MediaStream(null))

    // MP4 ファイルをロードする
    try {
      const mp4MediaStream = await Mp4MediaStream.load(files[0])
      dispatch(setMp4MediaStream(mp4MediaStream))
    } catch (e) {
      // ロードに失敗したらファイル選択をクリアする
      event.target.value = ""
      throw e
    }
  }
  if (mediaType !== 'mp4Media') {
    return null
  }
  return (
    <FormGroup className="form-inline" controlId="mp4File">
      <TooltipFormLabel kind="mp4File">mp4File:</TooltipFormLabel>
      <Form.Control type="file" disabled={disabled} onChange={onChange} />
    </FormGroup>
  )
}
