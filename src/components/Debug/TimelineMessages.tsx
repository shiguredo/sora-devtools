import React from "react";

import { useAppSelector } from "@/app/hooks";
import { Message } from "@/components/Debug/Message";
import type { TimelineMessage } from "@/types";

const DATA_CHANNEL_COLORS: { [key: string]: string } = {
  signaling: "#ff00ff",
  notify: "#ffff00",
  push: "#98fb98",
  e2ee: "#00ffff",
  stats: "#ffc0cb",
};

const WebSocketLabel: React.FC = () => {
  return (
    <span className="me-1" style={{ color: "#00ff00" }}>
      [websocket]
    </span>
  );
};

const PeerConnectionLabel: React.FC = () => {
  return (
    <span className="me-1" style={{ color: "#ff8c00" }}>
      [peerconnection]
    </span>
  );
};

const SoraLabel: React.FC = () => {
  return (
    <span className="me-1" style={{ color: "#bce2e8" }}>
      [sora]
    </span>
  );
};

const SoraDemoLabel: React.FC = () => {
  return (
    <span className="me-1" style={{ color: "#73b8e2" }}>
      [sora-demo]
    </span>
  );
};

type DataChannelLabelProps = {
  id?: number | null;
  label?: string | null;
};
const DataChannelLabel: React.FC<DataChannelLabelProps> = (props) => {
  const { label, id } = props;
  const color = label && Object.keys(DATA_CHANNEL_COLORS).includes(label) ? DATA_CHANNEL_COLORS[label] : undefined;
  return (
    <span className="me-1" style={color ? { color: color } : {}}>
      [datachannel]{label ? `[${label}]` : ""}
      {typeof id === "number" ? `[${id}]` : ""}
    </span>
  );
};

const Collapse: React.FC<TimelineMessage> = (props) => {
  const { timestamp, logType, dataChannelId, dataChannelLabel, type, data } = props;
  const title = `${type}`;
  let labelComponent;
  if (logType === "websocket") {
    labelComponent = <WebSocketLabel />;
  } else if (logType === "datachannel") {
    labelComponent = <DataChannelLabel id={dataChannelId} label={dataChannelLabel} />;
  } else if (logType === "peerconnection") {
    labelComponent = <PeerConnectionLabel />;
  } else if (logType === "sora") {
    labelComponent = <SoraLabel />;
  } else if (logType === "sora-demo") {
    labelComponent = <SoraDemoLabel />;
  }
  return <Message title={title} timestamp={timestamp} description={data} label={labelComponent} />;
};

const Log = React.memo((props: TimelineMessage) => {
  return <Collapse {...props} />;
});

export const TimelineMessages: React.FC = () => {
  const timelineMessages = useAppSelector((state) => state.timelineMessages);
  const debugFilterText = useAppSelector((state) => state.debugFilterText);
  const filteredMessages = timelineMessages.filter((message) => {
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
        const key = `${message.timestamp}-${message.type}`;
        return <Log key={key} {...message} />;
      })}
    </>
  );
};
