import { setDebugFilterText } from "@/app/actions";
import { debugFilterText, timelineExpandAll } from "@/app/signals";
import { FormGroup, FormInput, FormLabel } from "@/components/ui";

export function DebugFilter() {
  const debugFilterTextValue = debugFilterText.value;
  const isExpanded = timelineExpandAll.value === true;

  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setDebugFilterText(target.value);
  };

  const handleToggle = (): void => {
    timelineExpandAll.value = !isExpanded;
  };

  return (
    <FormGroup className="flex items-center gap-2 my-2" controlId="channelId">
      <button
        type="button"
        className="text-white/80 hover:text-white text-2xl cursor-pointer bg-transparent border border-white/50 rounded px-2"
        onClick={handleToggle}
      >
        {isExpanded ? "▼" : "▶"}
      </button>
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
