import { debugFilterText, logMessages } from "@/app/signals";
import type { LogMessage } from "@/types";

import { Message } from "./Message.tsx";
import { parseLogDescription } from "./parseLogDescription.ts";
import type { LogDescription } from "./parseLogDescription.ts";

function Collapse(props: LogMessage) {
  const { message, timestamp } = props;
  // 異常系経路（getErrorMessage の素文字列）が混入しても render を落とさないよう受け側で防御する
  const description: LogDescription = parseLogDescription(message.description);
  return <Message title={message.title} timestamp={timestamp} description={description} />;
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
