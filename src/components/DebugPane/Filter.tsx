import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setDebugFilterText } from "@/app/actions";
import { $debugFilterText } from "@/app/store";

export const DebugFilter: FunctionComponent = () => {
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    setDebugFilterText(event.currentTarget.value);
  };
  return (
    <div className="debug-filter">
      <label className="form-label" htmlFor="debugFilter">
        Filter:
      </label>
      <input
        type="text"
        id="debugFilter"
        placeholder="Filter messages..."
        value={$debugFilterText.value}
        onChange={onChange}
        autoComplete="off"
      />
    </div>
  );
};
