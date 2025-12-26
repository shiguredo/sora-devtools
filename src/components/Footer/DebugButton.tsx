import { setDebug } from "@/app/actions";
import { debug } from "@/app/signals";

export function DebugButton() {
  const onClick = (): void => {
    setDebug(!debug.value);
  };
  const className = debug.value ? "btn btn-footer-debug-mode active" : "btn btn-footer-debug-mode";
  return (
    <div>
      <button type="button" className={className} onClick={onClick}>
        debug
      </button>
    </div>
  );
}
