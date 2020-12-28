import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";
import { DataChannelMessage } from "@/utils";

type CollapsePushProps = {
  message: DataChannelMessage;
  ariaControls: string;
};
const CollapseMessage: React.FC<CollapsePushProps> = (props) => {
  const { timestamp, id, label, type, data } = props.message;
  const title = `[${id}][${label}][${type}]`;
  return <Message title={title} timestamp={timestamp} description={data === null || data === undefined ? "" : data} defaultShow />;
};

const PushMessages: React.FC = () => {
  const DataChannelMessages = useSelector((state: SoraDemoState) => state.dataChannelMessages);
  return (
    <>
      {DataChannelMessages.map((message, index) => {
        const key = `${message.timestamp}-${index}`;
        return <CollapseMessage key={key} ariaControls={key} message={message} />;
      })}
    </>
  );
};

export default PushMessages;
