import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setDataChannelMessaging, SoraDemoState } from "@/slice";

const DataChannelMessaging: React.FC = () => {
  const dataChannelMessaging = useSelector((state: SoraDemoState) => state.dataChannelMessaging);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLTextAreaElement>): void => {
    dispatch(setDataChannelMessaging(event.target.value));
  };
  return (
    <div className="col-10 form-inline flex-nowrap align-items-start form-sora">
      <label className="mr-1 my-2" htmlFor="dataChannelMessaging">
        dataChannelMessaging:
      </label>
      <textarea
        id="dataChannelMessaging"
        className="form-control flex-fill"
        rows={15}
        onChange={onChange}
        defaultValue={dataChannelMessaging}
        placeholder={`[{"label":"#spam","max_packet_life_time":10,"ordered":true,"protocol":"efg","compress":false,"direction":"sendrecv"}]`}
      />
    </div>
  );
};

export default DataChannelMessaging;
