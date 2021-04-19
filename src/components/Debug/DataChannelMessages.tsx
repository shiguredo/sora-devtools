import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";
import { DataChannelMessage } from "@/utils";

const DATA_CHANNEL_COLORS: { [key: string]: string } = {
  signaling: "#00ff00",
  notify: "#ffff00",
  push: "#ff00ff",
  e2ee: "#00ffff",
  stats: "#ff0000",
};

const Label: React.FC<{ label: string; datachannelId: number | null }> = (props) => {
  const { label, datachannelId } = props;
  const color = Object.keys(DATA_CHANNEL_COLORS).includes(label) ? DATA_CHANNEL_COLORS[label] : undefined;
  return (
    <span style={color ? { color: color } : {}}>
      [{label}]{datachannelId ? `[${datachannelId}]` : null}
    </span>
  );
};

const Collapse: React.FC<DataChannelMessage> = (props) => {
  const { timestamp, id, label, type, data } = props;
  const title = `[${label}][${id}] ${type}`;
  const labelComponent = <Label label={label} datachannelId={id} />;
  return (
    <Message
      title={title}
      timestamp={timestamp}
      description={data === null || data === undefined ? "" : data}
      label={labelComponent}
    />
  );
};

const Log = React.memo((props: DataChannelMessage) => {
  return <Collapse {...props} />;
});

const DetaChannelMessages: React.FC = () => {
  const dataChannelMessages = useSelector((state: SoraDemoState) => state.dataChannelMessages);
  return (
    <>
      {dataChannelMessages.map((message) => {
        const key = `${message.timestamp}-${message.type}-${message.label}`;
        return <Log key={key} {...message} />;
      })}
    </>
  );
};

export default DetaChannelMessages;
