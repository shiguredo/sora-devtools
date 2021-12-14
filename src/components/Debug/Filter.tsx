import React from "react";
import { FormControl, FormGroup, FormLabel } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDebugFilterText } from "@/app/slice";

export const DebugFilter: React.FC = () => {
  const debugFilterText = useAppSelector((state) => state.debugFilterText);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDebugFilterText(event.target.value));
  };
  return (
    <FormGroup className="form-inline debug-filter" controlId="channelId">
      <FormLabel className="text-white">Filter:</FormLabel>
      <FormControl type="text" placeholder="Filter" value={debugFilterText} onChange={onChange} autoComplete="off" />
    </FormGroup>
  );
};
