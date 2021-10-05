import React from "react";

import { useAppSelector } from "@/app/hooks";
import { Message } from "@/components/Debug/Message";
import type { SignalingMessage } from "@/types";

const SIGNALING_COLORS: { [key: string]: string } = {
  websocket: "#00ff00",
  datachannel: "#ff00ff",
};

const Label: React.FC<{ text: string }> = (props) => {
  const { text } = props;
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined;
  return (
    <span className="me-1" style={color ? { color: color } : {}}>
      [{text}]
    </span>
  );
};

const Collapse: React.FC<SignalingMessage> = (props) => {
  const { data, type, timestamp, transportType } = props;
  const label = transportType ? <Label text={transportType} /> : null;
  return <Message title={type} timestamp={timestamp} description={data} label={label} />;
};

const Log = React.memo((props: SignalingMessage) => {
  return <Collapse {...props} />;
});

export const SignalingMessages: React.FC = () => {
  const signalingMessages = useAppSelector((state) => state.signalingMessages);
  return (
    <>
      {signalingMessages.map((message) => {
        const key = message.type + message.timestamp;
        return <Log key={key} {...message} />;
      })}
    </>
  );
};
