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

import styles from "./DataChannelForm.module.css";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

function IgnoreDisconnectWebSocketForm(props: { disabled: boolean }) {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    if (checkFormValue(target.value, IGNORE_DISCONNECT_WEBSOCKET)) {
      setIgnoreDisconnectWebSocket(target.value);
    }
  };
  return (
    <FormGroup controlId="ignoreDisconnectWebSocket">
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
    <FormGroup controlId="dataChannelSignaling">
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
      <div className={styles.row}>
        <div className={styles.autoWidth}>
          <FormGroup controlId="enabledDataChannel">
            <FormSwitch
              id="enabledDataChannel"
              name="enabledDataChannel"
              checked={enabledDataChannel.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            />
            <label htmlFor="enabledDataChannel" className={styles.label}>
              dataChannel
            </label>
          </FormGroup>
        </div>
      </div>
      {enabledDataChannel.value ? (
        <div className={styles.row}>
          <div className={styles.autoWidth}>
            <div className={styles.optionsRow}>
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
