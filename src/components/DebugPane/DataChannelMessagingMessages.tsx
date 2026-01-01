import { clearDataChannelMessages } from "@/app/actions";
import { dataChannelMessages } from "@/app/signals";
import { Button } from "@/components/ui";
import type { DataChannelMessage } from "@/types";

import { Message } from "./Message.tsx";

function ButtonClear() {
  const onClick = (): void => {
    clearDataChannelMessages();
  };
  return (
    <Button variant="secondary" onClick={onClick}>
      clear
    </Button>
  );
}

function Collapse(props: DataChannelMessage) {
  const { data, label, timestamp } = props;
  const headText = new TextDecoder().decode(data.slice(0, 6));
  if (headText === "ZAKURO") {
    const connectionId = new TextDecoder().decode(data.slice(22, 48));
    const view = new DataView(data);
    const unixTimeMicro = view.getBigInt64(6);
    const counter = view.getBigInt64(14);
    const byteLength = data.byteLength;
    const description = `connectionId: ${connectionId}\nUnixTimeMicro: ${unixTimeMicro}\nCounter: ${counter}\nByteLength: ${byteLength}`;
    return (
      <Message
        title={`${label} ZAKURO`}
        timestamp={timestamp}
        description={description}
        defaultShow={true}
        wordBreak={true}
      />
    );
  }
  const uint8array = new Uint8Array(data);
  const description = `${uint8array.toString()}\n(${new TextDecoder().decode(data)})`;
  return (
    <Message
      title={label}
      timestamp={timestamp}
      description={description}
      defaultShow={true}
      wordBreak={true}
    />
  );
}

function Log(props: DataChannelMessage) {
  return <Collapse {...props} />;
}

export function DataChannelMessagingMessages() {
  const dataChannelMessagesValue = dataChannelMessages.value;
  return (
    <>
      <div className="py-1">
        <ButtonClear />
      </div>
      <div className="debug-messages">
        {dataChannelMessagesValue.map((message) => {
          const key = message.label + message.timestamp;
          return <Log key={key} {...message} />;
        })}
      </div>
    </>
  );
}
