import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";
import { NotifyMessage } from "@/utils";

type CollapseNotifyProps = {
  notify: NotifyMessage;
};
const CollapseNotify: React.FC<CollapseNotifyProps> = (props) => {
  const { notify } = props;
  return <Message title={notify.message.event_type} timestamp={notify.timestamp} description={notify.message} />;
};

const Log = React.memo((props: CollapseNotifyProps) => {
  return <CollapseNotify {...props} />;
});

const NotifyMessages: React.FC = () => {
  const { notifyMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      {notifyMessages.map((notify) => {
        return <Log key={notify.message.type + notify.timestamp} notify={notify} />;
      })}
    </>
  );
};

export default NotifyMessages;
