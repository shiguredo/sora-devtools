import type { TargetedMouseEvent } from "preact";
import { useSignal } from "@preact/signals";

import { ClipboardIcon } from "@/components/ClipboardIcon";
import { copyToClipboard } from "@/utils";
import * as signals from "@/app/signals";

interface Props {
  text: string;
}

// クリップボード + チェックマーク アイコン
function ClipboardCheckIcon() {
  return (
    <svg
      width="1em"
      height="1em"
      viewBox="0 0 16 16"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Copied</title>
      <path
        fillRule="evenodd"
        d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"
      />
      <path
        fillRule="evenodd"
        d="M9.5 1h-3a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"
      />
      <path
        fillRule="evenodd"
        d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z"
      />
    </svg>
  );
}

export function CopyLogButton(props: Props) {
  const copied = useSignal(false);

  const onClick = async (event: TargetedMouseEvent<HTMLButtonElement>): Promise<void> => {
    event.currentTarget.blur();
    const success = await copyToClipboard(props.text);
    if (!success) {
      signals.setAPIErrorAlertMessage("failed to copy log to clipboard");
      return;
    }
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  };

  const baseClasses = `
    px-2 py-1 text-sm rounded
    font-normal leading-normal text-center
    cursor-pointer select-none border
    transition-colors duration-150
  `;
  const stateClasses = copied.value
    ? "text-white bg-[#28a745] border-[#28a745]"
    : "text-white bg-bs-dark border-bs-dark hover:bg-[#1c1f23] hover:border-[#1a1e21]";

  return (
    <button type="button" className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      {copied.value ? <ClipboardCheckIcon /> : <ClipboardIcon />}
    </button>
  );
}
