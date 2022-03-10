import React, { useRef } from "react";
import { Button, FormControl, FormGroup, FormSelect } from "react-bootstrap";

import { useAppSelector } from "@/app/hooks";

export const SendDataChannelMessagingMessage: React.FC = () => {
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const sora = useAppSelector((state) => state.soraContents.sora);
  const datachannels = useAppSelector((state) => state.soraContents.datachannels);
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
      <div className="d-flex mt-2">
        <FormGroup className="me-1" controlId="sendDataChannelMessageLabel">
          <FormSelect name="sendDataChannelMessageLabel" ref={selectRef}>
            {datachannels.map((datachannel) => {
              return (
                <option key={datachannel.label} value={datachannel.label}>
                  {datachannel.label}
                </option>
              );
            })}
          </FormSelect>
        </FormGroup>
        <FormGroup className="flex-grow-1 me-1" controlId="sendDataChannelMessage">
          <FormControl className="flex-fill" placeholder="sendDataChannelMessageを指定" type="text" ref={textareaRef} />
        </FormGroup>
        <Button variant="secondary" onClick={handleSendMessage} disabled={datachannels.length === 0}>
          send
        </Button>
      </div>
      {0 < datachannels.length ? (
        <pre
          className="form-control mt-2"
          style={{ color: "#fff", backgroundColor: "#222222", maxHeight: "250px", minHeight: "250px" }}
        >
          {JSON.stringify(datachannels, null, 2)}
        </pre>
      ) : null}
    </>
  );
};
