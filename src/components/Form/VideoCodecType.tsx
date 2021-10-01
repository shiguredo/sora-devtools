import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setVideoCodecType, SoraDemoState } from "@/app/slice";
import { isVideoCodecType } from "@/utils";

const VideoCodecType: React.FC = () => {
  const { videoCodecType } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    if (isVideoCodecType(event.target.value)) {
      dispatch(setVideoCodecType(event.target.value));
    }
  };
  return (
    <div className="col-auto form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="videoCodecType">
        videoCodecType:
      </label>
      <select
        id="videoCodecType"
        name="videoCodecType"
        className="custom-select"
        value={videoCodecType}
        onChange={onChange}
      >
        <option value="">未指定</option>
        <option value="VP8">VP8</option>
        <option value="VP9">VP9</option>
        <option value="AV1">AV1</option>
        <option value="H264">H.264</option>
        <option value="H265">H.265</option>
      </select>
    </div>
  );
};

export default VideoCodecType;
