import React from 'react';
import { FormControl, FormGroup } from 'react-bootstrap';

import { setChannelId } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { isFormDisabled } from '@/utils';

import { TooltipFormLabel } from './TooltipFormLabel';

export const ChannelIdForm: React.FC = () => {
  const channelId = useAppSelector((state) => state.channelId);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setChannelId(event.target.value));
  };
  return (
    <FormGroup className="form-inline" controlId="channelId">
      <TooltipFormLabel kind="channelId">channelId:</TooltipFormLabel>
      <FormControl
        type="text"
        placeholder="ChannelIdを指定"
        value={channelId}
        onChange={onChange}
        disabled={disabled}
      />
    </FormGroup>
  );
};
