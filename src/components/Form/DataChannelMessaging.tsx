import React from "react";
import { FormCheck, FormControl, FormGroup } from "react-bootstrap";

import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { setDataChannelMessaging, setEnabledDataChannelMessaging } from "@/app/slice";
import { isFormDisabled } from "@/utils";

export const FormDataChannelMessaging: React.FC = () => {
  const enabledDataChannelMessaging = useAppSelector((state) => state.enabledDataChannelMessaging);
  const dataChannelMessaging = useAppSelector((state) => state.dataChannelMessaging);
  const connectionStatus = useAppSelector((state) => state.soraContents.connectionStatus);
  const disabled = isFormDisabled(connectionStatus);
  const dispatch = useAppDispatch();
  const textareaPlaceholder =
    "dataChannelMessagingを指定\n(例)\n" +
    JSON.stringify(
      [
        {
          label: "#spam",
          maxPacketLifeTime: 10,
          ordered: true,
          protocol: "efg",
          compress: false,
          direction: "sendrecv",
        },
      ],
      null,
      2
    );
  const onChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setEnabledDataChannelMessaging(event.target.checked));
  };
  const onChangeText = (event: React.ChangeEvent<HTMLInputElement>): void => {
    dispatch(setDataChannelMessaging(event.target.value));
  };
  return (
    <>
      <FormGroup className="form-inline" controlId="enabledDataChannelMessaging">
        <FormCheck
          type="switch"
          name="enabledDataChannelMessaging"
          label="dataChannelMessaging"
          checked={enabledDataChannelMessaging}
          onChange={onChangeSwitch}
          disabled={disabled}
        />
      </FormGroup>
      <FormGroup className="form-inline" controlId="dataChannelMessaging">
        <FormControl
          className="flex-fill w-500"
          as="textarea"
          placeholder={textareaPlaceholder}
          value={dataChannelMessaging}
          onChange={onChangeText}
          rows={12}
          disabled={!enabledDataChannelMessaging || disabled}
        />
      </FormGroup>
    </>
  );
};
