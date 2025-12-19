import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setRole } from "@/app/actions";
import { $connectionStatus, $localMediaStream, $role } from "@/app/store";
import { FormRow, FormSelect } from "@/components/Form";
import { ROLES } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const RoleForm: FunctionComponent = () => {
  const disabled = $localMediaStream.value !== null || isFormDisabled($connectionStatus.value);
  const onChange = (event: TargetedEvent<HTMLSelectElement>): void => {
    if (checkFormValue(event.currentTarget.value, ROLES)) {
      setRole(event.currentTarget.value);
    }
  };
  return (
    <FormRow>
      <TooltipFormLabel kind="role">role:</TooltipFormLabel>
      <FormSelect value={$role.value} onChange={onChange} disabled={disabled}>
        {ROLES.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </FormSelect>
    </FormRow>
  );
};
