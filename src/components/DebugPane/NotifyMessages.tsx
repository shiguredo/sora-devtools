import { debugFilterText, notifyMessages } from "@/app/signals";
import type { NotifyMessage } from "@/types";

import { Message } from "./Message.tsx";

const SIGNALING_COLORS: { [key: string]: string } = {
  websocket: "#00ff00",
  datachannel: "#ff00ff",
};

function Label(props: { text: string }) {
  const { text } = props;
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined;
  return (
    <span className="me-1" style={color ? { color: color } : {}}>
      [{text}]
    </span>
  );
}

type CollapseNotifyProps = {
  notify: NotifyMessage;
};
function CollapseNotify(props: CollapseNotifyProps) {
  const { notify } = props;
  const label = notify.transportType ? <Label text={notify.transportType} /> : null;
  return (
    <Message
      title={notify.message.event_type}
      timestamp={notify.timestamp}
      description={notify.message}
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
  const filteredMessages = notifyMessagesValue.filter((message) => {
    return debugFilterTextValue.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return JSON.stringify(message).indexOf(filterText) >= 0;
    });
  });
  return (
    <div className="debug-messages">
      {filteredMessages.map((notify) => {
        return <Log key={notify.message.type + notify.timestamp} notify={notify} />;
      })}
    </div>
  );
}
