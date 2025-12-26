import { setDebug } from "@/app/actions";
import { debug } from "@/app/signals";

export function DebugButton() {
  const onClick = (): void => {
    setDebug(!debug.value);
  };
  const classNames = ["btn", "btn-light", "btn-header-debug-mode", "btn-sm", "ms-1"];
  if (debug.value) {
    classNames.push("active");
  }
  return (
    <input
      className={classNames.join(" ")}
      type="button"
      name="debug"
      defaultValue="debug"
      onClick={onClick}
    />
  );
}
