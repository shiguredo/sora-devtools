import React, { useRef } from "react";
import { Button, FormControl, FormGroup, FormSelect } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";

export const DebugSendDataChannelMessaging: React.FC = () => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const sora = useAppSelector((state) => state.soraContents.sora);
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textareaRef.current === null) {
      return;
    }
    const label = selectRef.current.value;
    let text = textareaRef.current.value;
    try {
      text = JSON.parse(textareaRef.current.value);
    } catch (_) {
      // JSON parse に失敗しても何もしない
    }
    if (sora) {
      sora.sendMessage(label, text);
    }
  };
  return (
    <>
      <div className="d-flex">
        <FormGroup className="me-1" controlId="sendDataChannelMessaging">
          <FormSelect name="sendDataChannelMessaging" ref={selectRef}>
            {sora
              ? sora.messagingDataChannels.map((messagingDataChannel) => {
                  return (
                    <option key={messagingDataChannel.label} value={messagingDataChannel.label}>
                      {messagingDataChannel.label}
                    </option>
                  );
                })
              : null}
          </FormSelect>
        </FormGroup>
        <FormGroup className="flex-grow-1 me-1" controlId="sendDataChannelMessaging">
          <FormControl
            className="flex-fill"
            placeholder="sendDataChannelMessagingを指定"
            type="text"
            ref={textareaRef}
          />
        </FormGroup>
        <FormGroup className="" controlId="sendDataChannelMessaging">
          <Button
            variant="secondary"
            onClick={handleSendMessage}
            disabled={sora === null || sora.messagingDataChannels.length === 0}
          >
            send
          </Button>
        </FormGroup>
      </div>
      <pre className="form-control mt-2" style={{ color: "#fff", backgroundColor: "#222222", maxHeight: "250px" }}>
        {sora ? JSON.stringify(sora.messagingDataChannels, null, 2) : "\r\n"}
      </pre>
    </>
  );
};
