import React from 'react';

import { disposeTestMediaAccess, testMediaAccess } from '@/app/actions';
import { useAppDispatch, useAppSelector } from '@/app/hooks';

export const MediaAccessButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const mediaAccess = (): void => {
    dispatch(testMediaAccess());
  };
  const disposeMediaAccess = (): void => {
    dispatch(disposeTestMediaAccess());
  };
  const localTestMediaStream = useAppSelector((state) => state.localTestMediaStream);
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="media_access"
        defaultValue={localTestMediaStream === null ? 'media access' : 'dispose'}
        onClick={localTestMediaStream === null ? mediaAccess : disposeMediaAccess}
      />
    </div>
  );
};
