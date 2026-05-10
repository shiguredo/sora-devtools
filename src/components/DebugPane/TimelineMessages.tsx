import type { ComponentChild } from "preact";

import { debugFilterText, timelineMessages } from "@/app/signals";
import type { TimelineMessage } from "@/types";

import { Message } from "./Message.tsx";

const DATA_CHANNEL_COLORS: Record<string, string> = {
  signaling: "#ff00ff",
  notify: "#ffff00",
  push: "#98fb98",
  stats: "#ffc0cb",
};

function WebSocketLabel() {
  return (
    <span className="me-1" style={{ color: "#00ff00" }}>
      [websocket]
    </span>
  );
}

function PeerConnectionLabel() {
  return (
    <span className="me-1" style={{ color: "#ff8c00" }}>
      [peerconnection]
    </span>
  );
}

function SoraLabel() {
  return (
    <span className="me-1" style={{ color: "#bce2e8" }}>
      [sora]
    </span>
  );
}

function SoraDevtoolsLabel() {
  return (
    <span className="me-1" style={{ color: "#73b8e2" }}>
      [sora-devtools]
    </span>
  );
}

interface DataChannelLabelProps {
  id?: number | null;
  label?: string | null;
}
function DataChannelLabel(props: DataChannelLabelProps) {
  const { label, id } = props;
  const color =
    label && Object.keys(DATA_CHANNEL_COLORS).includes(label)
      ? DATA_CHANNEL_COLORS[label]
      : undefined;
  return (
    <span className="me-1" style={color ? { color } : {}}>
      [datachannel]{label ? `[${label}]` : ""}
      {typeof id === "number" ? `[${id}]` : ""}
    </span>
  );
}

function Collapse(props: TimelineMessage) {
  const { timestamp, logType, dataChannelId, dataChannelLabel, type, data } = props;
  const title = type;
  let labelComponent: ComponentChild;
  switch (logType) {
    case "websocket": {
      labelComponent = <WebSocketLabel />;
      break;
    }
    case "datachannel": {
      labelComponent = <DataChannelLabel id={dataChannelId} label={dataChannelLabel} />;
      break;
    }
    case "peerconnection": {
      labelComponent = <PeerConnectionLabel />;
      break;
    }
    case "sora": {
      labelComponent = <SoraLabel />;
      break;
    }
    case "sora-devtools": {
      labelComponent = <SoraDevtoolsLabel />;
      break;
    }
  }
  return (
    <Message title={title} timestamp={timestamp} description={data ?? ""} label={labelComponent} />
  );
}

function Log(props: TimelineMessage) {
  return <Collapse {...props} />;
}

export function TimelineMessages() {
  const timelineMessagesValue = timelineMessages.value;
  const debugFilterTextValue = debugFilterText.value;
  const filteredMessages = timelineMessagesValue.filter((message) =>
    debugFilterTextValue.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return JSON.stringify(message).includes(filterText);
    }),
  );
  return (
    <div className="overflow-y-auto h-full">
      {filteredMessages.map((message) => {
        let key = `${message.timestamp}-${message.type}`;
        // datachannel onopen が同時刻に発火することがあるため key に datachannel label を追加する
        if (message.dataChannelLabel) {
          key += `-${message.dataChannelLabel}`;
        }
        return <Log key={key} {...message} />;
      })}
    </div>
  );
}
