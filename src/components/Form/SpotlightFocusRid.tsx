import React from "react";
import { FormGroup, FormLabel, FormSelect } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setSpotlightFocusRid } from "@/app/slice";
import { SPOTLIGHT_FOCUS_RIDS } from "@/constants";
import { isSpotlightFocusRid } from "@/utils";

export const FormSpotlightFocusRid: React.FC = () => {
  const spotlightFocusRid = useAppSelector((state) => state.spotlightFocusRid);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isSpotlightFocusRid(event.target.value)) {
      dispatch(setSpotlightFocusRid(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline" controlId="spotlightFocusRid">
      <FormLabel>spotlightFocusRid:</FormLabel>
      <FormSelect value={spotlightFocusRid} onChange={onChange}>
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
