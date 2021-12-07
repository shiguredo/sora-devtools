import React from "react";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { clearDataChannelMessages } from "@/app/slice";
import { Message } from "@/components/Debug/Message";
import type { DataChannelMessage } from "@/types";

const ButtonClear: React.FC = () => {
  const dispatch = useAppDispatch();
  const onClick = (): void => {
    dispatch(clearDataChannelMessages());
  };
  return <input className="btn btn-secondary" type="button" name="clear" defaultValue="clear" onClick={onClick} />;
};

const Collapse: React.FC<DataChannelMessage> = (props) => {
  const { data, label, timestamp } = props;
  const headText = new TextDecoder().decode(data.slice(0, 6));
  if (headText === "ZAKURO") {
    const view = new DataView(data);
    const unixTimeMicro = view.getBigInt64(6);
    const counter = view.getBigInt64(14);
    const byteLength = data.byteLength;
    const description = `UnixTimeMicro: ${unixTimeMicro}\nCounter: ${counter}\nByteLength: ${byteLength}`;
    return <Message title={label + " ZAKURO"} timestamp={timestamp} description={description} defaultShow wordBreak />;
  }
  const uint8array = new Uint8Array(data);
  const description = uint8array.toString() + `\n(${new TextDecoder().decode(data)})`;
  return <Message title={label} timestamp={timestamp} description={description} defaultShow wordBreak />;
};

const Log = React.memo((props: DataChannelMessage) => {
  return <Collapse {...props} />;
});

export const DataChannelMessagingMessages: React.FC = () => {
  const dataChannelMessages = useAppSelector((state) => state.dataChannelMessages);
  return (
    <>
      <div className="py-1">
        <ButtonClear />
      </div>
      <div className="debug-messages">
        {dataChannelMessages.map((message) => {
          const key = message.label + message.timestamp;
          return <Log key={key} {...message} />;
        })}
      </div>
    </>
  );
};
