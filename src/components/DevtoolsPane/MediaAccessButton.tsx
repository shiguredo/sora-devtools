import React from 'react';

import { mediaAccessAction } from '@/app/actions';
import { useAppDispatch } from '@/app/hooks';

export const MediaAccessButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const mediaAccess = (): void => {
    dispatch(mediaAccessAction());
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-secondary"
        type="button"
        name="media_access"
        defaultValue="media access"
        onClick={mediaAccess}
      />
    </div>
  );
};
