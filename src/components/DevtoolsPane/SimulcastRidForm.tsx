import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setSimulcastRid } from "@/app/actions";
import { $connectionStatus, $simulcastRid } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { SIMULCAST_RID } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const SimulcastRidForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, SIMULCAST_RID)) {
      setSimulcastRid(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="simulcastRid">simulcastRid:</TooltipFormLabel>
      <FormSelect value={$simulcastRid.value} onChange={onChange} disabled={disabled}>
        {SIMULCAST_RID.map((value) => (
          <option key={value} value={value}>
            {value === "" ? "未指定" : value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
