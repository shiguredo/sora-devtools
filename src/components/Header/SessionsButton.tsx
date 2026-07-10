import { useLocation } from "preact-iso";

export function SessionsButton() {
  const { route } = useLocation();

  const onClick = (): void => {
    route("/sessions");
  };

  const baseClasses = `
    ml-1 w-[85px] px-2 py-1 text-sm rounded
    font-normal leading-normal text-center no-underline align-middle
    cursor-pointer select-none border
    transition-colors duration-150
  `;
  const stateClasses =
    "text-black bg-bs-light border-bs-light hover:bg-[#e2e6ea] hover:border-[#dae0e5]";

  return (
    <button type="button" className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
      Sessions
    </button>
  );
}
