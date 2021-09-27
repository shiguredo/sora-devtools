import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setEnabledDataChannelMessaging, SoraDemoState } from "@/slice";

const EnabledDataChannelMessaging: React.FC = () => {
  const { enabledDataChannelMessaging } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledDataChannelMessaging(event.target.checked));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <div className="form-check">
        <input
          id="enabledDataChannelMessaging"
          name="enabledDataChannelMessaging"
          className="form-check-input"
          type="checkbox"
          checked={enabledDataChannelMessaging}
          onChange={onChange}
        />
        <label className="form-check-label" htmlFor="enabledDataChannelMessaging">
          dataChannelMessaging
        </label>
      </div>
    </div>
  );
};

export default EnabledDataChannelMessaging;
