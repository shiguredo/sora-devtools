import React from "react";

import { useAppSelector } from "@/app/hooks";
import { Message } from "@/components/Debug/Message";
import type { LogMessage } from "@/types";

const Collapse: React.FC<LogMessage> = (props) => {
  const { message, timestamp } = props;
  return <Message title={message.title} timestamp={timestamp} description={JSON.parse(message.description)} />;
};

const Log = React.memo((props: LogMessage) => {
  return <Collapse {...props} />;
});

export const LogMessages: React.FC = () => {
  const logMessages = useAppSelector((state) => state.logMessages);
  return (
    <>
      {logMessages.map((log) => {
        return <Log key={log.message.title + log.timestamp} {...log} />;
      })}
    </>
  );
};
