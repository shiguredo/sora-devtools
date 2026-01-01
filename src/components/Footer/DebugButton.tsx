import { setDebug } from "@/app/actions";
import { debug } from "@/app/signals";

export function DebugButton() {
  const onClick = (): void => {
    setDebug(!debug.value);
  };
  // モバイル表示時（768px未満）のみ表示
  const baseClasses = `
    hidden max-md:block
    w-[65px] h-[65px] rounded-full
    fixed bottom-[25px] right-[25px]
    text-white opacity-90
    transition-colors duration-150
  `;
  const stateClasses = debug.value
    ? "bg-[#ff4c93] hover:bg-[#ff0066]"
    : "bg-bs-secondary hover:bg-[#5a6268]";
  return (
    <div>
      <button type="button" className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
        debug
      </button>
    </div>
  );
}
