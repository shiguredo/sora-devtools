import React from "react";
import { useSelector } from "react-redux";

import Message from "@/components/Debug/Message";
import { SoraDemoState } from "@/slice";
import { LogMessage } from "@/utils";

const CollapseLog: React.FC<LogMessage> = (props) => {
  const { message, timestamp } = props;
  return <Message title={message.title} timestamp={timestamp} description={JSON.parse(message.description)} />;
};

const LogMessages: React.FC = () => {
  const { logMessages } = useSelector((state: SoraDemoState) => state);
  return (
    <>
      {logMessages.map((log) => {
        return <CollapseLog key={log.message.title + log.timestamp} {...log} />;
      })}
    </>
  );
};

export default LogMessages;
