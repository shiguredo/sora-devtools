import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";
import { DataChannelMessage } from "@/utils";

const Collapse: React.FC<DataChannelMessage> = (props) => {
  const { data, label, timestamp } = props;
  return <Message title={label} timestamp={timestamp} description={data} />;
};

const Log = React.memo((props: DataChannelMessage) => {
  return <Collapse {...props} />;
});

const DataChannelMessages: React.FC = () => {
  const dataChannelMessages = useSelector((state: SoraDemoState) => state.dataChannelMessages);
  return (
    <>
      {dataChannelMessages.map((message) => {
        const key = message.label + message.timestamp;
        return <Log key={key} {...message} />;
      })}
    </>
  );
};

export default DataChannelMessages;
