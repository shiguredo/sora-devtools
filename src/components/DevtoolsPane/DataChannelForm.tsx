import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import {
  setDataChannelSignaling,
  setEnabledDataChannel,
  setIgnoreDisconnectWebSocket,
} from "@/app/actions";
import {
  $connectionStatus,
  $dataChannelSignaling,
  $enabledDataChannel,
  $ignoreDisconnectWebSocket,
} from "@/app/store";
import { FormRow, FormSelect, FormSwitch } from "@/components/Form";
import { DATA_CHANNEL_SIGNALING, IGNORE_DISCONNECT_WEBSOCKET } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

const IgnoreDisconnectWebSocketForm: FunctionComponent<{ disabled: boolean }> = (props) => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, IGNORE_DISCONNECT_WEBSOCKET)) {
      setIgnoreDisconnectWebSocket(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="ignoreDisconnectWebSocket">
        ignoreDisconnectWebSocket:
      </TooltipFormLabel>
      <FormSelect
        value={$ignoreDisconnectWebSocket.value}
        onChange={onChange}
        disabled={props.disabled}
      >
        {IGNORE_DISCONNECT_WEBSOCKET.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};

const DataChannelSignalingForm: FunctionComponent<{ disabled: boolean }> = (props) => {
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, DATA_CHANNEL_SIGNALING)) {
      setDataChannelSignaling(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="dataChannelSignaling">dataChannelSignaling:</TooltipFormLabel>
      <FormSelect value={$dataChannelSignaling.value} onChange={onChange} disabled={props.disabled}>
        {DATA_CHANNEL_SIGNALING.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};

export const DataChannelForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledDataChannel(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <FormSwitch
          id="enabledDataChannel"
          checked={$enabledDataChannel.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        />
        <label className="cursor-pointer" htmlFor="enabledDataChannel">
          dataChannel
        </label>
      </FormRow>
      {$enabledDataChannel.value ? (
        <>
          <DataChannelSignalingForm disabled={disabled} />
          <IgnoreDisconnectWebSocketForm disabled={disabled} />
        </>
      ) : null}
    </>
  );
};
