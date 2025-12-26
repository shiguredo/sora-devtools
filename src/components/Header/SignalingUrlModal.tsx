import { useEffect, useRef, useState } from "react";
import { Button, FormControl } from "react-bootstrap";

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import { type UrlEntry, loadUrlEntries, purgeUrlEntriesFromOPFS, saveUrlEntriesToOPFS } from "@/opfs";

type SignalingUrlModalProps = {
  show: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
};

export function SignalingUrlModal({ show, onClose, buttonRef }: SignalingUrlModalProps) {
  const [modalTop, setModalTop] = useState(0);
  const [modalLeft, setModalLeft] = useState(0);
  const [urlEntries, setUrlEntries] = useState<UrlEntry[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [error, setError] = useState("");
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // URL が wss:// または ws:// で始まるかチェック
  const isValidUrl = (url: string): boolean => {
    return url.startsWith("wss://") || url.startsWith("ws://");
  };

  // モーダル表示時に OPFS から URL エントリを読み込む
  useEffect(() => {
    if (show) {
      void loadUrlEntries().then((entries) => {
        setUrlEntries(entries);
      });
      setNewUrl("");
      setError("");
      setDraggedIndex(null);
      setDragOverIndex(null);
    }
  }, [show]);

  // ボタンの位置に基づいてモーダルの位置を計算
  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalTop(rect.bottom + 4);
      // モーダルの右端が画面からはみ出ないようにする
      const modalWidth = 700;
      const rightEdge = rect.right;
      const left = Math.max(10, rightEdge - modalWidth);
      setModalLeft(left);
    }
  }, [show, buttonRef]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && show) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [show, onClose]);

  const handleAddUrl = () => {
    const trimmedUrl = newUrl.trim();
    if (trimmedUrl === "") {
      return;
    }
    if (!isValidUrl(trimmedUrl)) {
      setError("URL は wss:// または ws:// で始まる必要があります");
      return;
    }
    // 重複チェック
    if (urlEntries.some((entry) => entry.url === trimmedUrl)) {
      setError("この URL は既に追加されています");
      return;
    }
    setUrlEntries([...urlEntries, { url: trimmedUrl, enabled: true }]);
    setNewUrl("");
    setError("");
  };

  const handleDeleteUrl = (index: number) => {
    setUrlEntries(urlEntries.filter((_, i) => i !== index));
  };

  const handleToggleEnabled = (index: number) => {
    setUrlEntries(
      urlEntries.map((entry, i) => (i === index ? { ...entry, enabled: !entry.enabled } : entry)),
    );
  };

  // ドラッグアンドドロップのハンドラー
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (index: number) => {
    if (draggedIndex !== null && draggedIndex !== index) {
      const newEntries = [...urlEntries];
      const [draggedEntry] = newEntries.splice(draggedIndex, 1);
      newEntries.splice(index, 0, draggedEntry);
      setUrlEntries(newEntries);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSave = async () => {
    // 有効な URL のみを Signal に設定
    const enabledUrls = urlEntries.filter((entry) => entry.enabled).map((entry) => entry.url);

    // Signal を更新
    setSignalingUrlCandidates(enabledUrls);

    // URL が設定されている場合は enabledSignalingUrlCandidates を true にする
    if (enabledUrls.length > 0) {
      setEnabledSignalingUrlCandidates(true);
    } else {
      setEnabledSignalingUrlCandidates(false);
    }

    // OPFS に全エントリを保存（enabled 状態も含む）
    await saveUrlEntriesToOPFS(urlEntries);

    onClose();
  };

  const handlePurge = async () => {
    setUrlEntries([]);
    setSignalingUrlCandidates([]);
    setEnabledSignalingUrlCandidates(false);
    await purgeUrlEntriesFromOPFS();
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <>
      {/* オーバーレイ */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 998,
        }}
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
        style={{
          position: "fixed",
          top: `${modalTop}px`,
          left: `${modalLeft}px`,
          width: "700px",
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "0.375rem",
          zIndex: 1000,
          boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
          padding: "1.5rem",
        }}
      >
        <div className="mb-3">
          <strong>signalingUrlCandidates</strong>
        </div>

        {/* URL 追加フォーム */}
        <div className="d-flex gap-2 mb-3">
          <FormControl
            type="text"
            placeholder="wss://example.com/signaling"
            value={newUrl}
            onChange={(e) => {
              const value = (e.target as HTMLInputElement).value;
              setNewUrl(value);
              // リアルタイムバリデーション
              if (value.trim() === "") {
                setError("");
              } else if (!isValidUrl(value.trim())) {
                setError("URL は wss:// または ws:// で始まる必要があります");
              } else if (urlEntries.some((entry) => entry.url === value.trim())) {
                setError("この URL は既に追加されています");
              } else {
                setError("");
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
            isInvalid={error !== ""}
            style={{ flex: 1 }}
          />
          <Button variant="primary" onClick={handleAddUrl} disabled={error !== "" || newUrl.trim() === ""}>
            追加
          </Button>
        </div>
        {error && <small className="text-danger mb-2 d-block">{error}</small>}

        {/* URL リスト */}
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            border: urlEntries.length > 0 ? "1px solid #dee2e6" : "none",
            borderRadius: "0.375rem",
          }}
        >
          {urlEntries.map((entry, index) => (
            <div
              key={entry.url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(index)}
              onDragEnd={handleDragEnd}
              className="d-flex align-items-center gap-2 p-2"
              style={{
                borderBottom: index < urlEntries.length - 1 ? "1px solid #dee2e6" : "none",
                backgroundColor:
                  dragOverIndex === index
                    ? "#e9ecef"
                    : entry.enabled
                      ? "transparent"
                      : "#f8f9fa",
                opacity: draggedIndex === index ? 0.5 : 1,
                cursor: "grab",
              }}
            >
              <span
                style={{
                  color: "#6c757d",
                  cursor: "grab",
                  userSelect: "none",
                }}
              >
                &#x2630;
              </span>
              <input
                type="checkbox"
                checked={entry.enabled}
                onChange={() => handleToggleEnabled(index)}
                style={{ cursor: "pointer" }}
              />
              <span
                style={{
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: entry.enabled ? "inherit" : "#6c757d",
                  textDecoration: entry.enabled ? "none" : "line-through",
                }}
                title={entry.url}
              >
                {entry.url}
              </span>
              <Button
                variant="outline-danger"
                size="sm"
                onClick={() => handleDeleteUrl(index)}
                style={{ padding: "0.1rem 0.4rem", lineHeight: 1 }}
              >
                &times;
              </Button>
            </div>
          ))}
        </div>

        {urlEntries.length === 0 && (
          <div className="text-muted text-center py-3">URL が追加されていません</div>
        )}

        <small className="text-muted mt-2 d-block">設定は OPFS に保存されます</small>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <Button variant="outline-danger" onClick={handlePurge}>
            Purge
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </>
  );
}
