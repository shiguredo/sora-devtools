import { setMaxNotifyMessages } from "@/app/actions";
import { maxNotifyMessages } from "@/app/signals";
import { FormGroup, FormLabel, FormSelect } from "@/components/ui";

const OPTIONS = [100, 500, 1000, 5000] as const;

export function NotifyMaxMessages() {
  const currentMax = maxNotifyMessages.value;

  const onChange = (event: Event): void => {
    const target = event.target as HTMLSelectElement;
    setMaxNotifyMessages(Number(target.value));
  };

  return (
    <FormGroup className="flex items-center gap-2 my-2" controlId="maxNotifyMessages">
      <FormLabel className="text-white">Max:</FormLabel>
      <FormSelect value={String(currentMax)} onChange={onChange} className="w-24">
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </FormSelect>
    </FormGroup>
  );
}
