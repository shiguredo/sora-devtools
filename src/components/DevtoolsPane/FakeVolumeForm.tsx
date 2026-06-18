import { FormGroup } from "@/components/ui";

import { fakeVolume, mediaType, setFakeVolume } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function FakeVolumeForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setFakeVolume(target.value);
  };
  if (mediaType.value !== "fakeMedia") {
    return null;
  }
  return (
    <FormGroup className="flex items-center gap-2" controlId="fakeVolume">
      <TooltipFormLabel kind="fakeVolume">fakeVolume:</TooltipFormLabel>
      <input
        type="range"
        min="0"
        max="1"
        step="0.25"
        value={fakeVolume.value}
        onChange={onChange}
        className="w-32"
      />
    </FormGroup>
  );
}
