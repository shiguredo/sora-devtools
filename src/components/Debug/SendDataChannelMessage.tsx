import React, { useRef } from "react";
import { Button, FormControl, FormGroup, FormSelect } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";

export const DebugSendDataChannelMessage: React.FC = () => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const sora = useAppSelector((state) => state.soraContents.sora);
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textareaRef.current === null) {
      return;
    }
    const label = selectRef.current.value;
    if (sora) {
      sora.sendMessage(label, new TextEncoder().encode(textareaRef.current.value));
    }
  };
  return (
    <>
      <div className="d-flex">
        <FormGroup className="me-1" controlId="sendDataChannelMessageLabel">
          <FormSelect name="sendDataChannelMessageLabel" ref={selectRef}>
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
        <FormGroup className="flex-grow-1 me-1" controlId="sendDataChannelMessage">
          <FormControl className="flex-fill" placeholder="sendDataChannelMessageを指定" type="text" ref={textareaRef} />
        </FormGroup>
        <Button
          variant="secondary"
          onClick={handleSendMessage}
          disabled={sora === null || sora.messagingDataChannels.length === 0}
        >
          send
        </Button>
      </div>
      {sora && 0 < sora.messagingDataChannels.length ? (
        <pre className="form-control mt-2" style={{ color: "#fff", backgroundColor: "#222222", maxHeight: "250px" }}>
          {JSON.stringify(sora.messagingDataChannels, null, 2)}
        </pre>
      ) : null}
    </>
  );
};
