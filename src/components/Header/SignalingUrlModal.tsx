import { useSignal } from "@preact/signals";
import type { RefObject } from "preact";
import { createPortal } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import { loadUrlEntries, purgeUrlEntriesFromOPFS, saveUrlEntriesToOPFS } from "@/opfs";
import type { UrlEntry } from "@/opfs";

import styles from "./SignalingUrlModal.module.css";

// URL が wss:// または ws:// で始まるかチェック
const isValidUrl = (url: string): boolean => url.startsWith("wss://") || url.startsWith("ws://");

// エントリの背景色クラスを決定する
function getEntryBackgroundClassName(isDragOver: boolean, isEnabled: boolean): string {
  if (isDragOver) {
    return styles.entryDragOver;
  }
  if (isEnabled) {
    return "";
  }
  return styles.entryDisabled;
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

  // ESC キーでモーダルを閉じる
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
      error.value = "URL must start with wss:// or ws://";
      return;
    }
    // 重複チェック
    if (urlEntries.value.some((entry) => entry.url === trimmedUrl)) {
      error.value = "this URL has already been added";
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
      error.value = "URL must start with wss:// or ws://";
    } else if (urlEntries.value.some((entry) => entry.url === value.trim())) {
      error.value = "this URL has already been added";
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
        className={styles.overlay}
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
        className={styles.modal}
        style={{
          top: `${modalTop.value}px`,
          left: `${modalLeft.value}px`,
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className={styles.heading}>
          <strong>signalingUrlCandidates</strong>
        </div>

        {/* URL 追加フォーム */}
        <div className={styles.formRow}>
          <input
            type="text"
            className={`${styles.input} ${error.value ? styles.inputError : styles.inputNormal}`}
            placeholder="wss://example.com/signaling"
            value={newUrl.value}
            onInput={handleInputChange}
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
          />
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleAddUrl}
            disabled={error.value !== "" || newUrl.value.trim() === ""}
          >
            追加
          </button>
        </div>
        {error.value && <small className={styles.error}>{error.value}</small>}

        {/* URL リスト */}
        <div
          className={`${styles.urlList} ${
            urlEntries.value.length > 0 ? styles.urlListBordered : ""
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
              className={`${styles.entry} ${
                index < urlEntries.value.length - 1 ? styles.entryDivided : ""
              } ${getEntryBackgroundClassName(dragOverIndex.value === index, entry.enabled)}`}
              style={{
                opacity: draggedIndex.value === index ? 0.5 : 1,
              }}
            >
              <span className={styles.dragHandle}>&#x2630;</span>
              <input
                type="checkbox"
                checked={entry.enabled}
                onChange={() => {
                  handleToggleEnabled(index);
                }}
                className={styles.checkbox}
              />
              <span
                className={`${styles.url} ${entry.enabled ? styles.urlEnabled : styles.urlDisabled}`}
                title={entry.url}
              >
                {entry.url}
              </span>
              <button
                type="button"
                className={`${styles.dangerButton} ${styles.deleteButton}`}
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
          <div className={styles.empty}>URL が追加されていません</div>
        )}

        <small className={styles.note}>設定は OPFS に保存されます</small>
        <div className={styles.footer}>
          <button
            type="button"
            className={`${styles.dangerButton} ${styles.purgeButton}`}
            onClick={handlePurge}
          >
            Purge
          </button>
          <div className={styles.footerActions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose}>
              Cancel
            </button>
            <button type="button" className={styles.primaryButton} onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
}
