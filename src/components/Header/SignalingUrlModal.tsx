import { useSignal } from "@preact/signals";
import type { RefObject } from "preact";
import { createPortal } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import { loadUrlEntries, purgeUrlEntriesFromOPFS, saveUrlEntriesToOPFS } from "@/opfs";
import type { UrlEntry } from "@/opfs";

// URL が wss:// または ws:// で始まるかチェック
const isValidUrl = (url: string): boolean => url.startsWith("wss://") || url.startsWith("ws://");

// エントリの背景色を決定する
function getEntryBackgroundColor(isDragOver: boolean, isEnabled: boolean): string {
  if (isDragOver) {
    return "#e9ecef";
  }
  if (isEnabled) {
    return "transparent";
  }
  return "#f8f9fa";
}

interface SignalingUrlModalProps {
  show: boolean;
  onClose: () => void;
  buttonRef: RefObject<HTMLButtonElement>;
}

export function SignalingUrlModal({ show, onClose, buttonRef }: SignalingUrlModalProps) {
  const modalTop = useSignal(0);
  const modalLeft = useSignal(0);
  const urlEntries = useSignal<UrlEntry[]>([]);
  const newUrl = useSignal("");
  const error = useSignal("");
  const draggedIndex = useSignal<number | null>(null);
  const dragOverIndex = useSignal<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // モーダル表示時に OPFS から URL エントリを読み込む
  useEffect(() => {
    if (show) {
      const loadEntries = async () => {
        const entries = await loadUrlEntries();
        urlEntries.value = entries;
      };
      void loadEntries();
      newUrl.value = "";
      error.value = "";
      draggedIndex.value = null;
      dragOverIndex.value = null;
    }
  }, [show, urlEntries, newUrl, error, draggedIndex, dragOverIndex]);

  // ボタンの位置に基づいてモーダルの位置を計算
  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      modalTop.value = rect.bottom + 4;
      // モーダルの右端が画面からはみ出ないようにする
      const modalWidth = 700;
      const rightEdge = rect.right;
      const left = Math.max(10, rightEdge - modalWidth);
      modalLeft.value = left;
    }
  }, [show, buttonRef, modalTop, modalLeft]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && show) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onClose]);

  const handleAddUrl = () => {
    const trimmedUrl = newUrl.value.trim();
    if (trimmedUrl === "") {
      return;
    }
    if (!isValidUrl(trimmedUrl)) {
      error.value = "URL は wss:// または ws:// で始まる必要があります";
      return;
    }
    // 重複チェック
    if (urlEntries.value.some((entry) => entry.url === trimmedUrl)) {
      error.value = "この URL は既に追加されています";
      return;
    }
    urlEntries.value = [...urlEntries.value, { url: trimmedUrl, enabled: true }];
    newUrl.value = "";
    error.value = "";
  };

  const handleDeleteUrl = (index: number) => {
    urlEntries.value = urlEntries.value.filter((_, i) => i !== index);
  };

  const handleToggleEnabled = (index: number) => {
    urlEntries.value = urlEntries.value.map((entry, i) =>
      i === index ? { ...entry, enabled: !entry.enabled } : entry,
    );
  };

  // ドラッグアンドドロップのハンドラー
  const handleDragStart = (index: number) => {
    draggedIndex.value = index;
  };

  const handleDragOver = (e: DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex.value !== null && draggedIndex.value !== index) {
      dragOverIndex.value = index;
    }
  };

  const handleDragLeave = () => {
    dragOverIndex.value = null;
  };

  const handleDrop = (index: number) => {
    if (draggedIndex.value !== null && draggedIndex.value !== index) {
      const newEntries = [...urlEntries.value];
      const [draggedEntry] = newEntries.splice(draggedIndex.value, 1);
      newEntries.splice(index, 0, draggedEntry);
      urlEntries.value = newEntries;
    }
    draggedIndex.value = null;
    dragOverIndex.value = null;
  };

  const handleDragEnd = () => {
    draggedIndex.value = null;
    dragOverIndex.value = null;
  };

  const handleSave = async () => {
    // 有効な URL のみを Signal に設定
    const enabledUrls = urlEntries.value.filter((entry) => entry.enabled).map((entry) => entry.url);

    // Signal を更新
    setSignalingUrlCandidates(enabledUrls);

    // URL が設定されている場合は enabledSignalingUrlCandidates を true にする
    if (enabledUrls.length > 0) {
      setEnabledSignalingUrlCandidates(true);
    } else {
      setEnabledSignalingUrlCandidates(false);
    }

    // OPFS に全エントリを保存（enabled 状態も含む）
    await saveUrlEntriesToOPFS(urlEntries.value);

    onClose();
  };

  const handlePurge = async () => {
    urlEntries.value = [];
    setSignalingUrlCandidates([]);
    setEnabledSignalingUrlCandidates(false);
    await purgeUrlEntriesFromOPFS();
  };

  const handleInputChange = (e: Event) => {
    const { value } = e.target as HTMLInputElement;
    newUrl.value = value;
    // リアルタイムバリデーション
    if (value.trim() === "") {
      error.value = "";
    } else if (!isValidUrl(value.trim())) {
      error.value = "URL は wss:// または ws:// で始まる必要があります";
    } else if (urlEntries.value.some((entry) => entry.url === value.trim())) {
      error.value = "この URL は既に追加されています";
    } else {
      error.value = "";
    }
  };

  const handleInputKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  if (!show) {
    return null;
  }

  const modalContent = (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed inset-0 bg-black/50 z-998"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            onClose();
          }
        }}
      />
      {/* モーダル */}
      <div
        ref={modalRef}
        className="fixed w-175 bg-white border border-gray-300 rounded-md z-1000 shadow-lg p-6"
        style={{
          top: `${modalTop.value}px`,
          left: `${modalLeft.value}px`,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="mb-3">
          <strong>signalingUrlCandidates</strong>
        </div>

        {/* URL 追加フォーム */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            className={`flex-1 px-3 py-1.5 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error.value ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="wss://example.com/signaling"
            value={newUrl.value}
            onInput={handleInputChange}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            className="px-3 py-1.5 text-sm text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddUrl}
            disabled={error.value !== "" || newUrl.value.trim() === ""}
          >
            追加
          </button>
        </div>
        {error.value && <small className="text-red-500 mb-2 block">{error.value}</small>}

        {/* URL リスト */}
        <div
          className={`max-h-50 overflow-y-auto rounded-md ${
            urlEntries.value.length > 0 ? "border border-gray-300" : ""
          }`}
        >
          {urlEntries.value.map((entry, index) => (
            <div
              key={entry.url}
              draggable
              onDragStart={() => {
                handleDragStart(index);
              }}
              onDragOver={(e) => {
                handleDragOver(e, index);
              }}
              onDragLeave={handleDragLeave}
              onDrop={() => {
                handleDrop(index);
              }}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-2 p-2 ${
                index < urlEntries.value.length - 1 ? "border-b border-gray-300" : ""
              }`}
              style={{
                backgroundColor: getEntryBackgroundColor(
                  dragOverIndex.value === index,
                  entry.enabled,
                ),
                opacity: draggedIndex.value === index ? 0.5 : 1,
                cursor: "grab",
              }}
            >
              <span className="text-gray-500 cursor-grab select-none">&#x2630;</span>
              <input
                type="checkbox"
                checked={entry.enabled}
                onChange={() => {
                  handleToggleEnabled(index);
                }}
                className="cursor-pointer"
              />
              <span
                className={`flex-1 overflow-hidden text-ellipsis whitespace-nowrap ${
                  entry.enabled ? "text-gray-900" : "text-gray-500 line-through"
                }`}
                title={entry.url}
              >
                {entry.url}
              </span>
              <button
                type="button"
                className="px-1.5 py-0.5 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
                onClick={() => {
                  handleDeleteUrl(index);
                }}
              >
                &times;
              </button>
            </div>
          ))}
        </div>

        {urlEntries.value.length === 0 && (
          <div className="text-gray-500 text-center py-3">URL が追加されていません</div>
        )}

        <small className="text-gray-500 mt-2 block">設定は OPFS に保存されます</small>
        <div className="flex justify-between mt-3">
          <button
            type="button"
            className="px-3 py-1.5 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
            onClick={handlePurge}
          >
            Purge
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              className="px-3 py-1.5 text-sm text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-3 py-1.5 text-sm text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
