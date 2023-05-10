import React from 'react';
import { Form, FormGroup } from 'react-bootstrap';

import { setFakeVolume } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

import { TooltipFormLabel } from './TooltipFormLabel';

export const FakeVolumeForm: React.FC = () => {
  const mediaType = useAppSelector((state) => state.mediaType);
  const fakeVolume = useAppSelector((state) => state.fakeVolume);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setFakeVolume(event.target.value));
  };
  if (mediaType !== 'fakeMedia') {
    return null;
  }
  return (
    <FormGroup className="form-inline" controlId="fakeVolume">
      <TooltipFormLabel kind="fakeVolume">fakeVolume:</TooltipFormLabel>
      <Form.Range min="0" max="1" step="0.25" value={fakeVolume} onChange={onChange} />
    </FormGroup>
  );
};
