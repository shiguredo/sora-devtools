import type React from "react";
import { useRef } from "react";
import { Button, FormControl, FormGroup, FormSelect } from "react-bootstrap";

import { useSoraDevtoolsStore } from "@/app/store";

export const SendDataChannelMessagingMessage: React.FC = () => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora);
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus);
  const dataChannels = useSoraDevtoolsStore((state) => state.soraContents.dataChannels);
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textareaRef.current === null) {
      return;
    }
    const label = selectRef.current.value;
    if (sora && connectionStatus === "connected") {
      void sora.sendMessage(label, new TextEncoder().encode(textareaRef.current.value));
    }
  };
  return (
    <>
      <div className="d-flex mt-2">
        <FormGroup className="me-1" controlId="sendDataChannelMessageLabel">
          <FormSelect name="sendDataChannelMessageLabel" ref={selectRef}>
            {dataChannels.map((datachannel) => {
              return (
                <option key={datachannel.label} value={datachannel.label}>
                  {datachannel.label}
                </option>
              );
            })}
          </FormSelect>
        </FormGroup>
        <FormGroup className="flex-grow-1 me-1" controlId="sendDataChannelMessage">
          <FormControl
            className="flex-fill"
            placeholder="sendDataChannelMessageを指定"
            type="text"
            ref={textareaRef}
          />
        </FormGroup>
        <Button
          variant="secondary"
          onClick={handleSendMessage}
          disabled={dataChannels.length === 0}
        >
          send
        </Button>
      </div>
      {dataChannels.length > 0 ? (
        <pre
          className="form-control mt-2"
          style={{
            color: "#fff",
            backgroundColor: "#222222",
            maxHeight: "250px",
            minHeight: "250px",
          }}
        >
          {JSON.stringify(dataChannels, null, 2)}
        </pre>
      ) : null}
    </>
  );
};
