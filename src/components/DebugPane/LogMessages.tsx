import { memo } from "react";

import { debugFilterText, logMessages } from "@/app/signals";
import type { LogMessage } from "@/types";

import { Message } from "./Message.tsx";

const Collapse = memo<LogMessage>((props) => {
  const { message, timestamp } = props;
  return (
    <Message
      title={message.title}
      timestamp={timestamp}
      description={JSON.parse(message.description)}
    />
  );
});

const Log = memo<LogMessage>((props) => {
  return <Collapse {...props} />;
});

export function LogMessages() {
  const logMessagesValue = logMessages.value;
  const debugFilterTextValue = debugFilterText.value;
  const filteredMessages = logMessagesValue.filter((message) => {
    return debugFilterTextValue.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return JSON.stringify(message).indexOf(filterText) >= 0;
    });
  });
  return (
    <div className="debug-messages">
      {filteredMessages.map((log, index) => {
        return <Log key={log.message.title + String(index) + log.timestamp} {...log} />;
      })}
    </div>
  );
}
