import { FormGroup, FormLabel, FormInput } from "@/components/ui";

import { setDebugFilterText } from "@/app/actions";
import { debugFilterText } from "@/app/signals";

export function DebugFilter() {
  const debugFilterTextValue = debugFilterText.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setDebugFilterText(target.value);
  };
  return (
    <FormGroup className="flex items-center gap-2 my-2" controlId="channelId">
      <FormLabel className="text-white">Filter:</FormLabel>
      <FormInput
        type="text"
        placeholder="Filter"
        value={debugFilterTextValue}
        onChange={onChange}
      />
    </FormGroup>
  );
}
