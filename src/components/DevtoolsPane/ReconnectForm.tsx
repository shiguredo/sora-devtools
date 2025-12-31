import { FormGroup } from "@/components/ui";

import { setReconnect } from "@/app/actions";
import { isFormDisabled, reconnect } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function ReconnectForm() {
  const disabled = isFormDisabled.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setReconnect(target.checked);
  };
  return (
    <div className="flex flex-wrap gap-2">
      <div className="w-auto">
        <FormGroup className="flex items-center gap-2" controlId="reconnect">
          <TooltipFormCheck
            kind="reconnect"
            checked={reconnect.value}
            onChange={onChange}
            disabled={disabled}
          >
            reconnect
          </TooltipFormCheck>
        </FormGroup>
      </div>
    </div>
  );
}
