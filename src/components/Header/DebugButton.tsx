import { setDebug } from "@/app/actions";
import { debug } from "@/app/signals";

export function DebugButton() {
  const onClick = (): void => {
    setDebug(!debug.value);
  };
  const baseClasses = `
    ml-1 inline-block px-2 py-1 text-sm rounded
    font-normal leading-normal text-center no-underline align-middle
    cursor-pointer select-none border
    transition-colors duration-150
  `;
  const stateClasses = debug.value
    ? "text-white bg-[#ff4c93] border-[#ff4c93] hover:bg-[#ff1a6f] hover:border-[#ff1a6f]"
    : "text-black bg-bs-light border-bs-light hover:bg-[#e2e6ea] hover:border-[#dae0e5]";
  return (
    <button type="button" className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      debug
    </button>
  );
}
