import { setDataChannels, setEnabledDataChannels } from "@/app/actions";
import { dataChannels, enabledDataChannels, isFormDisabled } from "@/app/signals";
import { Button, FormGroup } from "@/components/ui";

import { JSONInputField } from "./JSONInputField.tsx";
import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function DataChannelsForm() {
  const disabled = isFormDisabled.value;
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
  const onChangeSwitch = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setEnabledDataChannels(target.checked);
  };
  return (
    <>
      <div className="form-row">
        <div className="col-auto">
          <FormGroup className="flex items-center gap-2" controlId="enabledDataChannels">
            <TooltipFormCheck
              kind="dataChannels"
              checked={enabledDataChannels.value}
              onChange={onChangeSwitch}
              disabled={disabled}
            >
              dataChannels
            </TooltipFormCheck>
          </FormGroup>
        </div>
      </div>
      {enabledDataChannels.value ? (
        <div className="form-row">
          <div className="col-auto">
            <JSONInputField
              controlId="dataChannels"
              placeholder={textareaPlaceholder}
              value={dataChannels.value}
              setValue={(value) => {
                setDataChannels(value);
              }}
              disabled={disabled}
              rows={12}
              extraControls={
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => {
                    setDataChannels(exampleJsonString);
                  }}
                >
                  load template
                </Button>
              }
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
