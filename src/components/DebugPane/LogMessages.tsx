import React from "react";

import { useAppSelector } from "@/app/hooks";
import type { LogMessage } from "@/types";

import { Message } from "./Message";

const Collapse: React.FC<LogMessage> = (props) => {
  const { message, timestamp } = props;
  return <Message title={message.title} timestamp={timestamp} description={JSON.parse(message.description)} />;
};

const Log = React.memo((props: LogMessage) => {
  return <Collapse {...props} />;
});

export const LogMessages: React.FC = () => {
  const logMessages = useAppSelector((state) => state.logMessages);
  const debugFilterText = useAppSelector((state) => state.debugFilterText);
  const filteredMessages = logMessages.filter((message) => {
    return debugFilterText.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return 0 <= JSON.stringify(message).indexOf(filterText);
    });
  });
  return (
    <div className="debug-messages">
      {filteredMessages.map((log) => {
        return <Log key={log.message.title + log.timestamp} {...log} />;
      })}
    </div>
  );
};
