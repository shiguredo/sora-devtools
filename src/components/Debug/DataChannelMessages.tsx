import React from "react";

import { useAppSelector } from "@/app/hooks";
import { Message } from "@/components/Debug/Message";
import type { DataChannelMessage } from "@/types";

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

export const DataChannelMessages: React.FC = () => {
  const dataChannelMessages = useAppSelector((state) => state.dataChannelMessages);
  const debugFilterText = useAppSelector((state) => state.debugFilterText);
  const filteredMessages = dataChannelMessages.filter((message) => {
    return debugFilterText.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return 0 <= JSON.stringify(message).indexOf(filterText);
    });
  });
  return (
    <div className="debug-messages">
      {filteredMessages.map((message) => {
        const key = message.label + message.timestamp;
        return <Log key={key} {...message} />;
      })}
    </div>
  );
};
