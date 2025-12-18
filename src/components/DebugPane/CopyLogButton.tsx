import { memo } from "preact/compat";
import type { JSX } from "preact/jsx-runtime";

import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copy2clipboard } from "@/utils";

type Props = {
  text: string;
  disabled?: boolean;
};
export const CopyLogButton = memo<Props>((props) => {
  const onClick = (event: JSX.TargetedMouseEvent<HTMLButtonElement>): void => {
    copy2clipboard(props.text);
    event.currentTarget.blur();
  };
  if (props.disabled) {
    return <div style={{ height: "31px" }} />;
  }
  return (
    <button
      type="button"
      className="px-2 py-1 text-sm bg-gray-800 text-white hover:bg-gray-900 rounded"
      onClick={onClick}
    >
      <ClipboardIcon />
    </button>
  );
});
