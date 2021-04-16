import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";
import { DataChannelMessage } from "@/utils";

const DATA_CHANNEL_COLORS: {[key: string]: string} = {
  signaling: "#00ff00",
  notify: "#ffff00",
  push: "#ff00ff",
  e2ee: "#00ffff",
  stats: "#ffffff",
};

type CollapsePushProps = {
  message: DataChannelMessage;
  ariaControls: string;
};

const CollapseMessage: React.FC<CollapsePushProps> = (props) => {
  const { timestamp, id, label, type, data } = props.message;
  const title = `[${label}][${id}] ${type}`;
  const color = Object.keys(DATA_CHANNEL_COLORS).includes(label) ? DATA_CHANNEL_COLORS[label] : undefined;
  return (
    <Message
      title={title}
      timestamp={timestamp}
      description={data === null || data === undefined ? "" : data}
      titleColor={color}
    />
  );
};

const DetaChannelEvents: React.FC = () => {
  const dataChannelMessages = useSelector((state: SoraDemoState) => state.dataChannelMessages);
  return (
    <>
      {dataChannelMessages.map((message, index) => {
        const key = `${message.timestamp}-${index}`;
        return <CollapseMessage key={key} ariaControls={key} message={message} />;
      })}
    </>
  );
};

export default DetaChannelEvents;
