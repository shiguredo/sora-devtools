import { useRef } from "preact/hooks";

import { connectionStatus, sora, soraDataChannels } from "@/app/signals";

export function SendDataChannelMessagingMessage() {
  const selectRef = useRef<HTMLSelectElement>(null);
  const textareaRef = useRef<HTMLInputElement>(null);
  const soraValue = sora.value;
  const connectionStatusValue = connectionStatus.value;
  const dataChannelsValue = soraDataChannels.value;
  const handleSendMessage = (): void => {
    if (selectRef.current === null || textareaRef.current === null) {
      return;
    }
    const label = selectRef.current.value;
    if (soraValue && connectionStatusValue === "connected") {
      void soraValue.sendMessage(label, new TextEncoder().encode(textareaRef.current.value));
    }
  };
  return (
    <>
      <div className="flex mt-2">
        <div className="mr-1">
          <select
            name="sendDataChannelMessageLabel"
            ref={selectRef}
            className="block w-full px-3 py-1.5 pr-8 text-base leading-normal text-gray-900 bg-white border border-gray-300 rounded-md appearance-none cursor-pointer focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
          >
            {dataChannelsValue.map((datachannel) => {
              return (
                <option key={datachannel.label} value={datachannel.label}>
                  {datachannel.label}
                </option>
              );
            })}
          </select>
        </div>
        <div className="flex-grow mr-1">
          <input
            className="block w-full px-3 py-1.5 text-base leading-normal text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
            placeholder="sendDataChannelMessageを指定"
            type="text"
            ref={textareaRef}
          />
        </div>
        <button
          type="button"
          className="px-3 py-1.5 text-base bg-gray-600 text-white border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSendMessage}
          disabled={dataChannelsValue.length === 0}
        >
          send
        </button>
      </div>
      {dataChannelsValue.length > 0 ? (
        <pre
          className="mt-2 p-3 rounded-md"
          style={{
            color: "#fff",
            backgroundColor: "#222222",
            maxHeight: "250px",
            minHeight: "250px",
          }}
        >
          {JSON.stringify(dataChannelsValue, null, 2)}
        </pre>
      ) : null}
    </>
  );
}
