import type React from 'react'
import { Form, FormGroup } from 'react-bootstrap'

import { setFrameRate } from '@/app/actions'
import { useAppDispatch, useAppSelector } from '@/app/hooks'

import { TooltipFormLabel } from './TooltipFormLabel'

const FRAME_RATE_DATA = Array<string>('60', '30', '24', '20', '15', '10', '5')

export const FrameRateForm: React.FC = () => {
  const frameRate = useAppSelector((state) => state.frameRate)
  const dispatch = useAppDispatch()
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setFrameRate(event.target.value))
  }
  return (
    <FormGroup className="form-inline" controlId="frameRate">
      <TooltipFormLabel kind="frameRate">frameRate:</TooltipFormLabel>
      <Form.Control
        className="form-frame-rate"
        type="text"
        value={frameRate}
        onChange={onChange}
        list="frameRateData"
        placeholder="未指定"
      />
      <datalist id="frameRateData">
        {FRAME_RATE_DATA.map((value) => {
          return <option key={value} value={value} />
        })}
      </datalist>
    </FormGroup>
  )
}
