import React from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/app/slice";
import Message from "@/components/Debug/Message";
import { LogMessage } from "@/utils";

const Collapse: React.FC<LogMessage> = (props) => {
  const { message, timestamp } = props;
  return <Message title={message.title} timestamp={timestamp} description={JSON.parse(message.description)} />;
};

const Log = React.memo((props: LogMessage) => {
  return <Collapse {...props} />;
});

const LogMessages: React.FC = () => {
  const { logMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      {logMessages.map((log) => {
        return <Log key={log.message.title + log.timestamp} {...log} />;
      })}
    </>
  );
};

export default LogMessages;
