import React from 'react';

import { disposeTestMediaAccess, testMediaAccess } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { isFormDisabled } from '@/utils';

export const MediaAccessButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const mediaAccess = (): void => {
    dispatch(testMediaAccess());
  };
  const disposeMediaAccess = (): void => {
    dispatch(disposeTestMediaAccess());
  };
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const localTestMediaStream = useAppSelector((state) => state.localTestMediaStream);
  const disabled = localTestMediaStream === null && isFormDisabled(connectionStatus);
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="media_access"
        defaultValue={localTestMediaStream === null ? 'media access' : 'dispose'}
        onClick={localTestMediaStream === null ? mediaAccess : disposeMediaAccess}
        disabled={disabled}
      />
    </div>
  );
};
