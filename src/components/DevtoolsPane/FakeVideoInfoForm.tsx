import { FormGroup } from "@/components/ui";

import { fakeVideoShowChannelId, mediaType, setFakeVideoShowChannelId } from "@/app/signals";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export function FakeVideoInfoForm() {
  const onChangeShowChannelId = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setFakeVideoShowChannelId(target.checked);
  };
  if (mediaType.value !== "fakeMedia") {
    return null;
  }
  return (
    <FormGroup className="flex items-center gap-2" controlId="fakeVideoShowChannelId">
      <TooltipFormCheck
        kind="fakeVideoShowChannelId"
        checked={fakeVideoShowChannelId.value}
        disabled={false}
        onChange={onChangeShowChannelId}
      >
        fakeVideoShowChannelId
      </TooltipFormCheck>
    </FormGroup>
  );
}
