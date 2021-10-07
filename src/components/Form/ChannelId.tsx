import React from "react";
import { FormControl, FormGroup, FormLabel } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setChannelId } from "@/app/slice";

export const FormChannelId: React.FC = () => {
  const channelId = useAppSelector((state) => state.channelId);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setChannelId(event.target.value));
  };
  return (
    <FormGroup className="form-inline" controlId="channelId">
      <FormLabel>channelId:</FormLabel>
      <FormControl type="text" placeholder="ChannelIdを指定" value={channelId} onChange={onChange} />
    </FormGroup>
  );
};
