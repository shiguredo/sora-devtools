import { useSignal } from "@preact/signals";
import { useLocation } from "preact-iso";

import { copyURL } from "@/app/actions";

export function CopyUrlButton() {
  const copied = useSignal(false);
  const { route } = useLocation();

  const onClick = async (): Promise<void> => {
    const success = await copyURL();
    if (!success) {
      return;
    }
    route(`${globalThis.location.pathname}${globalThis.location.search}`, true);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  };

  const baseClasses = `
    ml-1 w-[85px] px-2 py-1 text-sm rounded
    font-normal leading-normal text-center no-underline align-middle
    cursor-pointer select-none border
    transition-colors duration-150
  `;
  const stateClasses = copied.value
    ? "text-white bg-[#28a745] border-[#28a745] hover:bg-[#218838] hover:border-[#1e7e34]"
    : "text-black bg-bs-light border-bs-light hover:bg-[#e2e6ea] hover:border-[#dae0e5]";

  return (
    <button type="button" className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      {copied.value ? (
        <span className="flex items-center justify-center gap-1">
          Copied
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </span>
      ) : (
        "Copy URL"
      )}
    </button>
  );
}
