import React from "react";
import { FormCheck, FormGroup, FormLabel } from "react-bootstrap";

import { setMediaType } from "@/app/actions";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { MEDIA_TYPES } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

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

export const MediaTypeForm: React.FC = () => {
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const mediaType = useAppSelector((state) => state.mediaType);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    if (checkFormValue(event.target.value, MEDIA_TYPES)) {
      dispatch(setMediaType(event.target.value));
    }
  };
  return (
    <FormGroup className="form-inline flex-wrap">
      <FormLabel>mediaType:</FormLabel>
      <FormRadio label="getUserMedia" mediaType={mediaType} disabled={disabled} onChange={onChange} />
      <FormRadio label="getDisplayMedia" mediaType={mediaType} disabled={disabled} onChange={onChange} />
      <FormRadio label="fakeMedia" mediaType={mediaType} disabled={disabled} onChange={onChange} />
    </FormGroup>
  );
};
