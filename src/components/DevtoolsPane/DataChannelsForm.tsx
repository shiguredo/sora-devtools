import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setDataChannels, setEnabledDataChannels } from "@/app/actions";
import { $connectionStatus, $dataChannels, $enabledDataChannels } from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const DataChannelsForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const exampleJsonString = JSON.stringify(
    [
      {
        label: "#devtools",
        maxPacketLifeTime: 10,
        ordered: true,
        compress: false,
        direction: "sendrecv",
      },
    ],
    null,
    2,
  );
  const textareaPlaceholder = `dataChannelsを指定\n(例)\n${exampleJsonString}`;
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledDataChannels(event.currentTarget.checked);
  };
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="dataChannels"
          checked={$enabledDataChannels.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          dataChannels
        </TooltipFormCheck>
      </FormRow>
      {$enabledDataChannels.value ? (
        <JSONInputField
          controlId="dataChannels"
          placeholder={textareaPlaceholder}
          value={$dataChannels.value}
          setValue={(value) => setDataChannels(value)}
          disabled={disabled}
          rows={12}
          extraControls={
            <button
              type="button"
              className="px-2 py-1 text-sm bg-slate-200 text-slate-700 hover:bg-slate-300 rounded"
              onClick={() => setDataChannels(exampleJsonString)}
            >
              load template
            </button>
          }
        />
      ) : null}
    </>
  );
};
