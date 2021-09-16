import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setChannelId, SoraDemoState } from "@/app/slice";

export const ChannelId: React.FC = () => {
  const { channelId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setChannelId(event.target.value));
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="channelId">
        channelId:
      </label>
      <input
        id="channelId"
        name="channelId"
        className="form-control"
        type="text"
        placeholder="ChannelIdを指定"
        value={channelId}
        onChange={onChange}
      />
    </div>
  );
};
