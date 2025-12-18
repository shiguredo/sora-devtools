import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setFakeVolume } from "@/app/actions";
import { $fakeVolume, $mediaType } from "@/app/store";
import { FormRow } from "@/components/Form";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export const FakeVolumeForm: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setFakeVolume(event.currentTarget.value);
  };
  if ($mediaType.value !== "fakeMedia") {
    return null;
  }
  return (
    <FormRow>
      <TooltipFormLabel kind="fakeVolume">fakeVolume:</TooltipFormLabel>
      <input
        type="range"
        min="0"
        max="1"
        step="0.25"
        value={$fakeVolume.value}
        onChange={onChange}
        className="w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
      />
    </FormRow>
  );
};
