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
  if (!data) {
    return <Message title={label} timestamp={timestamp} description="" defaultShow wordBreak />;
  }
  const headText = new TextDecoder().decode(data.slice(0, 6));
  if (headText === "ZAKURO") {
    const connectionId = new TextDecoder().decode(data.slice(22, 48));
    const view = new DataView(data);
    const unixTimeMicro = view.getBigInt64(6);
    const counter = view.getBigInt64(14);
    const { byteLength } = data;
    const description = `connectionId: ${connectionId}\nUnixTimeMicro: ${unixTimeMicro}\nCounter: ${counter}\nByteLength: ${byteLength}`;
    return (
      <Message
        title={`${label} ZAKURO`}
        timestamp={timestamp}
        description={description}
        defaultShow
        wordBreak
      />
    );
  }
  const uint8array = new Uint8Array(data);
  const description = `${uint8array.toString()}\n(${new TextDecoder().decode(data)})`;
  return (
    <Message title={label} timestamp={timestamp} description={description} defaultShow wordBreak />
  );
}

function Log(props: DataChannelMessage) {
  return <Collapse {...props} />;
}

export function DataChannelMessagingMessages() {
  const dataChannelMessagesValue = dataChannelMessages.value;
  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* 送信フォーム (メッセージ定義の表示) の下に clear ボタンを並べ、
          その下の残りの高さいっぱいにメッセージ一覧を置く。
          縦 flex にすることで、一覧が伸びても clear ボタンは自分の位置に留まる */}
      <div className="py-1">
        <ButtonClear />
      </div>
      {/* min-h-0 を外すと一覧が内容の高さまで伸びてペイン全体が縦スクロールになり、
          clear ボタンが押し出される。一覧のスクロールを有効にするため必須 */}
      <div className="overflow-y-auto flex-1 min-h-0">
        {dataChannelMessagesValue.map((message) => {
          const key = message.label + message.timestamp;
          return <Log key={key} {...message} />;
        })}
      </div>
    </div>
  );
}
