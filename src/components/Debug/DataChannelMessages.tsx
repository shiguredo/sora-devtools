import React from "react";

import { useAppSelector } from "@/app/hooks";
import { Message } from "@/components/Debug/Message";
import type { DataChannelMessage } from "@/types";

const Collapse: React.FC<DataChannelMessage> = (props) => {
  const { data, label, timestamp } = props;
  return <Message title={label} timestamp={timestamp} description={data} defaultShow />;
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
    <>
      {filteredMessages.map((message) => {
        const key = message.label + message.timestamp;
        return <Log key={key} {...message} />;
      })}
    </>
  );
};
