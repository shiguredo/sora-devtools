import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { setMetadata, SoraDemoState } from "@/slice";

const Metadata: React.FC = () => {
  const { metadata } = useSelector((state: SoraDemoState) => state);
  const dispatch = useDispatch();
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setMetadata(event.target.value));
  };
  return (
    <div className="col-10 form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="metadata">
        metadata:
      </label>
      <input
        id="metadata"
        name="metadata"
        className="form-control flex-fill"
        type="text"
        placeholder="Metadataを指定"
        value={metadata}
        onChange={onChange}
      />
    </div>
  );
};

export default Metadata;
