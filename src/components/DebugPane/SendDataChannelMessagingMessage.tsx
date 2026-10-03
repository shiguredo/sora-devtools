import { useRef } from "preact/hooks";

import { connectionStatus, sora, soraDataChannels } from "@/app/signals";

import styles from "./SendDataChannelMessagingMessage.module.css";

export function SendDataChannelMessagingMessage() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const soraValue = sora.value;
  const connectionStatusValue = connectionStatus.value;
  const dataChannelsValue = soraDataChannels.value;
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textareaRef.current === null) {
      return;
    }
    const label = selectRef.current.value;
    if (soraValue && connectionStatusValue === "connected") {
      void soraValue.sendMessage(label, new TextEncoder().encode(textareaRef.current.value));
    }
  };
  return (
    <>
      <div className={styles.row}>
        <div className={styles.labelColumn}>
          <select name="sendDataChannelMessageLabel" ref={selectRef} className={styles.select}>
            {dataChannelsValue.map((datachannel) => (
              <option key={datachannel.label} value={datachannel.label}>
                {datachannel.label}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.inputColumn}>
          <input
            className={styles.input}
            placeholder="sendDataChannelMessage を指定"
            type="text"
            ref={textareaRef}
          />
        </div>
        <button
          type="button"
          className={styles.sendButton}
          onClick={handleSendMessage}
          disabled={dataChannelsValue.length === 0}
        >
          send
        </button>
      </div>
      {dataChannelsValue.length > 0 ? (
        <pre className={styles.preview}>{JSON.stringify(dataChannelsValue, null, 2)}</pre>
      ) : null}
    </>
  );
}
