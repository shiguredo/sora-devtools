import { Mp4MediaStream } from '@shiguredo/mp4-media-stream'

import type React from 'react'
import { Form, FormGroup } from 'react-bootstrap'

import { setMp4MediaStream } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

// TODO: Mp4MediaFileForm にする？
export const Mp4FileForm: React.FC = () => {
  const mediaType = useAppSelector((state) => state.mediaType)
  const dispatch = useAppDispatch()
  const onChange = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const files = event.target.files
    if (files === null || files.length === 0) {
      return
    }
    const mp4MediaStream = await Mp4MediaStream.load(files[0])
    dispatch(setMp4MediaStream(mp4MediaStream))
  }
  if (mediaType !== 'mp4Media') {
    return null
  }
  return (
    <FormGroup className="form-inline" controlId="mp4File">
      <TooltipFormLabel kind="mp4File">inputFile:</TooltipFormLabel>
      <Form.Control type="file" onChange={onChange} />
    </FormGroup>
  )
}
