import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setClientId, SoraDemoState } from "@/slice";

const ClientId: React.FC = () => {
  const { clientId } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setClientId(event.target.value));
  };
  return (
    <div className="col-10 form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="channelId">
        clientId:
      </label>
      <input
        id="clientId"
        name="clientId"
        className="form-control flex-fill"
        type="text"
        placeholder="clientId を指定"
        value={clientId}
        onChange={onChange}
      />
    </div>
  );
};

export default ClientId;
