import { debugFilterText, logMessages } from "@/app/signals";
import type { LogMessage } from "@/types";

import { Message } from "./Message.tsx";

function Collapse(props: LogMessage) {
  const { message, timestamp } = props;
  return (
    <Message
      title={message.title}
      timestamp={timestamp}
      description={JSON.parse(message.description)}
    />
  );
}

function Log(props: LogMessage) {
  return <Collapse {...props} />;
}

export function LogMessages() {
  const logMessagesValue = logMessages.value;
  const debugFilterTextValue = debugFilterText.value;
  const filteredMessages = logMessagesValue.filter((message) =>
    debugFilterTextValue.split(" ").every((filterText) => {
      if (filterText === "") {
        return true;
      }
      return JSON.stringify(message).includes(filterText);
    }),
  );
  return (
    <div className="overflow-y-auto h-full">
      {filteredMessages.map((log) => (
        <Log key={`${log.timestamp}-${log.message.title}-${log.message.description}`} {...log} />
      ))}
    </div>
  );
}
