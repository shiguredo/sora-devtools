import type { FunctionComponent } from "preact";

import { $debugFilterText, $pushMessages } from "@/app/store";
import type { PushMessage } from "@/types";

import { Message } from "./Message.tsx";

const SIGNALING_COLORS: { [key: string]: string } = {
  websocket: "#00ff00",
  datachannel: "#ff00ff",
};

const Label: FunctionComponent<{ text: string }> = (props) => {
  const { text } = props;
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined;
  return <span style={color ? { color: color } : {}}>[{text}]</span>;
};

type CollapsePushProps = {
  push: PushMessage;
  ariaControls: string;
};
const Collapse: FunctionComponent<CollapsePushProps> = (props) => {
  const { push } = props;
  const label = push.transportType ? <Label text={push.transportType} /> : null;
  return (
    <Message
      title={push.message.type}
      timestamp={push.timestamp}
      description={push.message}
      label={label}
    />
  );
};

const Log: FunctionComponent<CollapsePushProps> = (props) => {
  return <Collapse {...props} />;
};

export const PushMessages: FunctionComponent = () => {
  const filteredMessages = $pushMessages.value.filter((message) => {
    return $debugFilterText.value.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return JSON.stringify(message).indexOf(filterText) >= 0;
    });
  });
  return (
    <div className="debug-messages">
      {filteredMessages.map((pushMessage, index) => {
        const key = `${pushMessage.timestamp}-${index}`;
        return <Log key={key} ariaControls={key} push={pushMessage} />;
      })}
    </div>
  );
};
