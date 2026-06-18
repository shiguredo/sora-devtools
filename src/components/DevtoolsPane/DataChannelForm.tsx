import { FormGroup, FormSelect, FormSwitch } from "@/components/ui";

import {
  setDataChannelSignaling,
  setEnabledDataChannel,
  setIgnoreDisconnectWebSocket,
} from "@/app/actions";
import {
  dataChannelSignaling,
  enabledDataChannel,
  ignoreDisconnectWebSocket,
  isFormDisabled,
} from "@/app/signals";
import { DATA_CHANNEL_SIGNALING, IGNORE_DISCONNECT_WEBSOCKET } from "@/constants";
import { checkFormValue } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

function IgnoreDisconnectWebSocketForm(props: { disabled: boolean }) {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, IGNORE_DISCONNECT_WEBSOCKET)) {
      setIgnoreDisconnectWebSocket(target.value);
    }
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="ignoreDisconnectWebSocket">
      <TooltipFormLabel kind="ignoreDisconnectWebSocket">
        ignoreDisconnectWebSocket:
      </TooltipFormLabel>
      <FormSelect
        name="ignoreDisconnectWebSocket"
        value={ignoreDisconnectWebSocket.value}
        onChange={onChange}
        disabled={props.disabled}
      >
        {IGNORE_DISCONNECT_WEBSOCKET.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormGroup>
  );
}

function DataChannelSignalingForm(props: { disabled: boolean }) {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, DATA_CHANNEL_SIGNALING)) {
      setDataChannelSignaling(target.value);
    }
  };
  return (
    <FormGroup className="flex items-center gap-2" controlId="dataChannelSignaling">
      <TooltipFormLabel kind="dataChannelSignaling">dataChannelSignaling:</TooltipFormLabel>
      <FormSelect
        name="dataChannelSignaling"
        value={dataChannelSignaling.value}
        onChange={onChange}
        disabled={props.disabled}
      >
        {DATA_CHANNEL_SIGNALING.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormGroup>
  );
}

export function DataChannelForm() {
  const disabled = isFormDisabled.value;
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledDataChannel(target.checked);
  };
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <div className="w-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledDataChannel">
            <FormSwitch
              id="enabledDataChannel"
              name="enabledDataChannel"
              checked={enabledDataChannel.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            />
            <label htmlFor="enabledDataChannel" className="cursor-pointer select-none">
              dataChannel
            </label>
          </FormGroup>
        </div>
      </div>
      {enabledDataChannel.value ? (
        <div className="flex flex-wrap gap-2">
          <div className="w-auto">
            <div className="flex flex-wrap gap-4">
              <div>
                <DataChannelSignalingForm disabled={disabled} />
              </div>
              <div>
                <IgnoreDisconnectWebSocketForm disabled={disabled} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
