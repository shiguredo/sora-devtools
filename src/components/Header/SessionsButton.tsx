import { useLocation } from "preact-iso";

export function SessionsButton() {
  const { path, route } = useLocation();
  const onSessionsPage = path === "/sessions";

  const onClick = (): void => {
    if (onSessionsPage) {
      // DevTools に戻る（signals は残るので接続状態は維持される）
      route("/");
      return;
    }
    route("/sessions");
  };

  const baseClasses = `
    ml-1 w-[85px] px-2 py-1 text-sm rounded
    font-normal leading-normal text-center no-underline align-middle
    cursor-pointer select-none border
    transition-colors duration-150
  `;
  // debug と同じ付け方（白文字 + 塗りつぶし）。色だけ debug のピンクと被らないようにする
  const stateClasses = onSessionsPage
    ? "text-white bg-[#20c997] border-[#20c997] hover:bg-[#1aa179] hover:border-[#1aa179]"
    : "text-black bg-bs-light border-bs-light hover:bg-[#e2e6ea] hover:border-[#dae0e5]";

  return (
    <button
      type="button"
      className={`${baseClasses} ${stateClasses}`}
      onClick={onClick}
      aria-pressed={onSessionsPage}
    >
      Sessions
    </button>
  );
}
