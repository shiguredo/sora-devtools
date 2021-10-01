import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/app/slice";
import { Message } from "@/components/Debug/Message";
import { NotifyMessage } from "@/utils";

const SIGNALING_COLORS: { [key: string]: string } = {
  websocket: "#00ff00",
  datachannel: "#ff00ff",
};

const Label: React.FC<{ text: string }> = (props) => {
  const { text } = props;
  const color = Object.keys(SIGNALING_COLORS).includes(text) ? SIGNALING_COLORS[text] : undefined;
  return <span style={color ? { color: color } : {}}>[{text}]</span>;
};

type CollapseNotifyProps = {
  notify: NotifyMessage;
};
const CollapseNotify: React.FC<CollapseNotifyProps> = (props) => {
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
};

const Log = React.memo((props: CollapseNotifyProps) => {
  return <CollapseNotify {...props} />;
});

export const NotifyMessages: React.FC = () => {
  const { notifyMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      {notifyMessages.map((notify) => {
        return <Log key={notify.message.type + notify.timestamp} notify={notify} />;
      })}
    </>
  );
};
