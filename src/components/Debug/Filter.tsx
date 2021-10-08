import React from "react";
import { FormControl, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDebugFilterText } from "@/app/slice";

export const Filter: React.FC = () => {
  const debugFilterText = useAppSelector((state) => state.debugFilterText);
  const debugType = useAppSelector((state) => state.debugType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDebugFilterText(event.target.value));
  };
  return (
    <FormGroup className="form-inline form-debug-filter" controlId="channelId">
      <FormControl type="text" placeholder="Filter" value={debugFilterText} onChange={onChange} autoComplete="off" disabled={debugType !== "timeline"} />
    </FormGroup>
  );
};
