import { setDebug } from "@/app/actions";
import { debug } from "@/app/signals";
import { Button } from "@/components/ui";

export function DebugButton() {
  const onClick = (): void => {
    setDebug(!debug.value);
  };
  const activeClasses = debug.value ? "bg-[#ff4c93] text-white hover:bg-[#ff1a6f]" : "";
  return (
    <Button variant="light" size="sm" className={`ml-1 ${activeClasses}`} onClick={onClick}>
      debug
    </Button>
  );
}
