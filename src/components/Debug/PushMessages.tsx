import React from "react";

import { useAppSelector } from "@/app/hooks";
import { Message } from "@/components/Debug/Message";
import type { PushMessage } from "@/types";

const SIGNALING_COLORS: { [key: string]: string } = {
  websocket: "#00ff00",
  datachannel: "#ff00ff",
};

const Label: React.FC<{ text: string }> = (props) => {
  const { text } = props;
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined;
  return <span style={color ? { color: color } : {}}>[{text}]</span>;
};

type CollapsePushProps = {
  push: PushMessage;
  ariaControls: string;
};
const Collapse: React.FC<CollapsePushProps> = (props) => {
  const { push } = props;
  const label = push.transportType ? <Label text={push.transportType} /> : null;
  return <Message title={push.message.type} timestamp={push.timestamp} description={push.message} label={label} />;
};

const Log = React.memo((props: CollapsePushProps) => {
  return <Collapse {...props} />;
});

export const PushMessages: React.FC = () => {
  const pushMessages = useAppSelector((state) => state.pushMessages);
  const debugFilterText = useAppSelector((state) => state.debugFilterText);
  const filteredMessages = pushMessages.filter((message) => {
    return debugFilterText.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return 0 <= JSON.stringify(message).indexOf(filterText);
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
