import React from "react";

import { useAppSelector } from "@/app/hooks";
import { Message } from "@/components/Debug/Message";
import type { DataChannelMessage } from "@/types";

const Collapse: React.FC<DataChannelMessage> = (props) => {
  const { data, label, timestamp } = props;
  const binaryData = new Uint8Array(data);
  const description = binaryData.toString() + `\n(${new TextDecoder().decode(binaryData)})`;
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
