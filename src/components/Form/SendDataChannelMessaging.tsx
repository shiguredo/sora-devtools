import React, { useRef } from "react";
import { useSelector } from "react-redux";

import { SoraDemoState } from "@/slice";

const SendDataChannelMessaging: React.FC = () => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const textRef = useRef<HTMLInputElement>(null);
  const { sora } = useSelector((state: SoraDemoState) => state.soraContents);
  if (!sora) {
    return null;
  }
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textRef.current === null) {
      return;
    }
    const label = selectRef.current.value;
    let text = textRef.current.value;
    try {
      text = JSON.parse(textRef.current.value);
    } catch (_) {
      // JSON parse に失敗しても何もしない
    }
    sora.sendMessage(label, text);
  };
  return (
    <div className="col-10 form-inline flex-nowrap form-sora">
      <label className="mr-1" htmlFor="audioCodecType">
        sendDataChannelMessaging:
      </label>
      <select id="dataChannelMessagingLabel" name="dataChannelMessagingLabel" className="custom-select" ref={selectRef}>
        {sora.messagingDataChannels.map((messagingDataChannel) => {
          return (
            <option key={messagingDataChannel.label} value={messagingDataChannel.label}>
              {messagingDataChannel.label}
            </option>
          );
        })}
      </select>
      <input
        id="sendDataChannelMessaging"
        name="sendDataChannelMessaging"
        className="form-control flex-fill"
        type="text"
        ref={textRef}
      />
      <input
        className="btn btn-secondary"
        type="button"
        name="sendDataChannelMessaging"
        defaultValue="sendDataChannelMessaging"
        onClick={handleSendMessage}
      />
    </div>
  );
};

export default SendDataChannelMessaging;
