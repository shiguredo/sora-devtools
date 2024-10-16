import type React from 'react'
import { Form, FormGroup } from 'react-bootstrap'

import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { TooltipFormLabel } from './TooltipFormLabel'

// TODO: Mp4MediaFileForm にする？
export const Mp4FileForm: React.FC = () => {
  const mediaType = useAppSelector((state) => state.mediaType)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
      //dispatch(setFakeVolume(event.target.value))
      throw "TODO"
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
