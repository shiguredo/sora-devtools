import type { FunctionComponent } from "preact";

import { setDebug } from "@/app/actions";
import { $debug } from "@/app/store";

export const DebugButton: FunctionComponent = () => {
  const onClick = (): void => {
    setDebug(!$debug.value);
  };

  return (
    <button
      type="button"
      className={`btn btn-sm ${$debug.value ? "btn-primary" : "btn-outline"}`}
      onClick={onClick}
    >
      Debug
    </button>
  );
};
