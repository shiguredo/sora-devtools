import type { ComponentChild } from "preact";

import { debugFilterText, timelineMessages } from "@/app/signals";
import type { TimelineMessage } from "@/types";

import styles from "./TimelineMessages.module.css";

import { Message } from "./Message.tsx";

const DATA_CHANNEL_COLORS: Record<string, string> = {
  signaling: "#ff00ff",
  notify: "#ffff00",
  push: "#98fb98",
  stats: "#ffc0cb",
};

function WebSocketLabel() {
  return <span className={styles.websocketLabel}>[websocket]</span>;
}

function PeerConnectionLabel() {
  return <span className={styles.peerConnectionLabel}>[peerconnection]</span>;
}

function SoraLabel() {
  return <span className={styles.soraLabel}>[sora]</span>;
}

function SoraDevtoolsLabel() {
  return <span className={styles.soraDevtoolsLabel}>[sora-devtools]</span>;
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
    <span className={styles.label} style={color ? { color } : {}}>
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
    <div className={styles.messages}>
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
