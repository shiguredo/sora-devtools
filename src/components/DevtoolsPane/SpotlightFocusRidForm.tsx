import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { setSpotlightFocusRid } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

export const SpotlightFocusRidForm: React.FC = () => {
  const spotlightFocusRid = useAppSelector((state) => state.spotlightFocusRid);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, SPOTLIGHT_FOCUS_RIDS)) {
      dispatch(setSpotlightFocusRid(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="spotlightFocusRid">
      <FormLabel>spotlightFocusRid:</FormLabel>
      <FormSelect value={spotlightFocusRid} onChange={onChange} disabled={disabled}>
        {SPOTLIGHT_FOCUS_RIDS.map((value) => {
          return (
            <option key={value} value={value}>
              {value === "" ? "未指定" : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
