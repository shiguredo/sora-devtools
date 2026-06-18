import { debugFilterText, notifyMessages } from "@/app/signals";
import type { NotifyMessage } from "@/types";

import { Message } from "./Message.tsx";

const SIGNALING_COLORS: Record<string, string> = {
  websocket: "#00ff00",
  datachannel: "#ff00ff",
};

function Label(props: { text: string }) {
  const { text } = props;
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined;
  return (
    <span className="me-1" style={color ? { color } : {}}>
      [{text}]
    </span>
  );
}

interface CollapseNotifyProps {
  notify: NotifyMessage;
}
function CollapseNotify(props: CollapseNotifyProps) {
  const { notify } = props;
  // transportType は型定義上必須 (TransportType) のため常に truthy
  const label = <Label text={notify.transportType} />;
  return (
    <Message
      title={notify.message.event_type}
      timestamp={notify.timestamp}
      description={notify.message as unknown as Record<string, unknown>}
      label={label}
    />
  );
}

function Log(props: CollapseNotifyProps) {
  return <CollapseNotify {...props} />;
}

export function NotifyMessages() {
  const notifyMessagesValue = notifyMessages.value;
  const debugFilterTextValue = debugFilterText.value;
  const filteredMessages = notifyMessagesValue.filter((message) =>
    debugFilterTextValue.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return JSON.stringify(message).includes(filterText);
    }),
  );
  return (
    <div className="overflow-y-auto h-full">
      {filteredMessages.map((notify) => (
        <Log key={notify.message.type + notify.timestamp} notify={notify} />
      ))}
    </div>
  );
}
