import React from "react";
import { FormCheck, FormGroup, FormLabel } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";

import { setMediaType, SoraDemoState } from "@/app/slice";
import { isMediaType } from "@/utils";

type FormRadioProps = {
  label: string;
  mediaType: string;
  disabled: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
};
const FormRadio: React.FC<FormRadioProps> = (props) => {
  const { label, disabled, onChange, mediaType } = props;
  return (
    <FormCheck
      type="radio"
      inline
      id={label}
      label={label}
      value={label}
      checked={mediaType === label}
      onChange={onChange}
      disabled={disabled}
    />
  );
};

export const FormMediaType: React.FC = () => {
  const soraContents = useSelector((state: SoraDemoState) => state.soraContents);
  const mediaType = useSelector((state: SoraDemoState) => state.mediaType);
  const disabled = soraContents.sora !== null;
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (isMediaType(event.target.value)) {
      dispatch(setMediaType(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline">
      <FormLabel>mediaType:</FormLabel>
      <FormRadio label="getUserMedia" mediaType={mediaType} disabled={disabled} onChange={onChange} />
      <FormRadio label="getDisplayMedia" mediaType={mediaType} disabled={disabled} onChange={onChange} />
      <FormRadio label="fakeMedia" mediaType={mediaType} disabled={disabled} onChange={onChange} />
    </FormGroup>
  );
};
