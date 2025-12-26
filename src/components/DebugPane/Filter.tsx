import { FormControl, FormGroup, FormLabel } from "react-bootstrap";

import { setDebugFilterText } from "@/app/actions";
import { debugFilterText } from "@/app/signals";

export function DebugFilter() {
  const debugFilterTextValue = debugFilterText.value;
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setDebugFilterText(target.value);
  };
  return (
    <FormGroup className="form-inline debug-filter" controlId="channelId">
      <FormLabel className="text-white">Filter:</FormLabel>
      <FormControl
        type="text"
        placeholder="Filter"
        value={debugFilterTextValue}
        onChange={onChange}
        autoComplete="off"
      />
    </FormGroup>
  );
}
