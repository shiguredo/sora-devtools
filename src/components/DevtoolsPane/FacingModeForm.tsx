import React from 'react';
import { FormGroup, FormSelect } from 'react-bootstrap';

import { setFacingMode } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { FACING_MODES } from '@/constants';
import { checkFormValue } from '@/utils';

import { TooltipFormLabel } from './TooltipFormLabel';

export const FacingModeForm: React.FC = () => {
  const facingMode = useAppSelector((state) => state.facingMode);
  const mediaType = useAppSelector((state) => state.mediaType);
  const dispatch = useAppDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.target.value, FACING_MODES)) {
      dispatch(setFacingMode(event.target.value));
    }
  };
  const disabled = mediaType !== 'getUserMedia';
  return (
    <FormGroup className="form-inline" controlId="facingMode">
      <TooltipFormLabel kind="facingMode">facingMode:</TooltipFormLabel>
      <FormSelect name="facingMode" value={facingMode} onChange={onChange} disabled={disabled}>
        {FACING_MODES.map((value) => {
          return (
            <option key={value} value={value}>
              {value === '' ? '未指定' : value}
            </option>
          );
        })}
      </FormSelect>
    </FormGroup>
  );
};
