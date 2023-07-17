import React from 'react';
import { FormGroup } from 'react-bootstrap';

import { setAudioTrack } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

import { TooltipFormCheck } from './TooltipFormCheck';

export const AudioTrackForm: React.FC = () => {
  const audioTrack = useAppSelector((state) => state.audioTrack);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setAudioTrack(event.target.checked));
  };
  return (
    <FormGroup className="form-inline" controlId="audioTrack">
      <TooltipFormCheck kind="audioTrack" checked={audioTrack} onChange={onChange} disabled={false}>
        Enable audio track
      </TooltipFormCheck>
    </FormGroup>
  );
};
