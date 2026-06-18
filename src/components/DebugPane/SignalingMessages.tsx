import { debugFilterText, signalingMessages } from "@/app/signals";
import type { SignalingMessage } from "@/types";

import { Message } from "./Message.tsx";

const SIGNALING_COLORS: Record<string, string> = {
  websocket: "#00ff00",
  datachannel: "#ff00ff",
};

function Label({ text }: { text: string }) {
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined;
  return (
    <span className="me-1" style={color ? { color } : {}}>
      [{text}]
    </span>
  );
}

function Collapse(props: SignalingMessage) {
  const { data, type, timestamp, transportType } = props;
  // transportType は型定義上必須 (TransportType) のため常に truthy
  const label = <Label text={transportType} />;
  return <Message title={type} timestamp={timestamp} description={data ?? ""} label={label} />;
}

function Log(props: SignalingMessage) {
  return <Collapse {...props} />;
}

export function SignalingMessages() {
  const signalingMessagesValue = signalingMessages.value;
  const debugFilterTextValue = debugFilterText.value;
  const filteredMessages = signalingMessagesValue.filter((message) =>
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
        const key = message.type + message.timestamp;
        return <Log key={key} {...message} />;
      })}
    </div>
  );
}
