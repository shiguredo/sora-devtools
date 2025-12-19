import { useSignal } from "@preact/signals";
import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import { $connectionStatus, $signalingUrlCandidates } from "@/app/store";
import { isFormDisabled } from "@/utils";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const SignalingUrlModal: FunctionComponent<Props> = ({ isOpen, onClose }) => {
  const localValue = useSignal($signalingUrlCandidates.value.join("\n"));
  const disabled = isFormDisabled($connectionStatus.value);

  if (!isOpen) return null;

  const onChangeText = (event: TargetedEvent<HTMLTextAreaElement>): void => {
    localValue.value = event.currentTarget.value;
  };

  const onSave = (): void => {
    const urls = localValue.value.split("\n").filter((url) => url.trim() !== "");
    setSignalingUrlCandidates(urls);
    // URL が設定されている場合は enabled にする
    setEnabledSignalingUrlCandidates(urls.length > 0);
    onClose();
  };

  const onBackdropClick = (event: MouseEvent): void => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Signaling URL</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Signaling URL Candidates
          </label>
          <textarea
            placeholder={`wss://sora.example.com/signaling\nwss://sora-backup.example.com/signaling`}
            value={localValue.value}
            onChange={onChangeText}
            rows={6}
            disabled={disabled}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500 font-mono"
          />
          <p className="mt-2 text-xs text-slate-500">Enter one URL per line</p>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-slate-200 bg-slate-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={disabled}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-slate-400 transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
