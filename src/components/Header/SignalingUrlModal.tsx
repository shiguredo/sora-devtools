import { useEffect, useRef, useState } from "react";
import { Button, FormControl } from "react-bootstrap";

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import { signalingUrlCandidates } from "@/app/signals";
import { saveSignalingUrlCandidatesToOPFS } from "@/opfs";

type SignalingUrlModalProps = {
  show: boolean;
  onClose: () => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
};

export function SignalingUrlModal({ show, onClose, buttonRef }: SignalingUrlModalProps) {
  const [modalTop, setModalTop] = useState(0);
  const [modalLeft, setModalLeft] = useState(0);
  const [localValue, setLocalValue] = useState("");
  const modalRef = useRef<HTMLDivElement>(null);

  // モーダル表示時に現在の signalingUrlCandidates を読み込む
  useEffect(() => {
    if (show) {
      setLocalValue(signalingUrlCandidates.value.join("\n"));
    }
  }, [show]);

  // ボタンの位置に基づいてモーダルの位置を計算
  useEffect(() => {
    if (show && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setModalTop(rect.bottom + 4);
      // モーダルの右端が画面からはみ出ないようにする
      const modalWidth = 500;
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

  const handleSave = async () => {
    const urls = localValue
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url !== "");

    // Signal を更新
    setSignalingUrlCandidates(urls);

    // URL が設定されている場合は enabledSignalingUrlCandidates を true にする
    if (urls.length > 0) {
      setEnabledSignalingUrlCandidates(true);
    }

    // OPFS に保存
    await saveSignalingUrlCandidatesToOPFS(urls);

    onClose();
  };

  const handleClear = async () => {
    setLocalValue("");
    setSignalingUrlCandidates([]);
    setEnabledSignalingUrlCandidates(false);
    await saveSignalingUrlCandidatesToOPFS([]);
    onClose();
  };

  const textareaPlaceholder = `signalingUrlCandidatesを指定
(例)
wss://sora0.example.com/signaling
wss://sora1.example.com/signaling
`;

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
          width: "500px",
          backgroundColor: "#ffffff",
          border: "1px solid #dee2e6",
          borderRadius: "0.375rem",
          zIndex: 1000,
          boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
          padding: "1.5rem",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <strong>signalingUrlCandidates</strong>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={onClose}
            style={{ padding: "0.2rem 0.5rem", lineHeight: 1 }}
          >
            &times;
          </Button>
        </div>
        <FormControl
          as="textarea"
          placeholder={textareaPlaceholder}
          value={localValue}
          onChange={(e) => setLocalValue((e.target as HTMLTextAreaElement).value)}
          rows={6}
          style={{ width: "100%" }}
        />
        <div className="d-flex justify-content-between align-items-center mt-3">
          <small className="text-muted">設定は OPFS に保存されます</small>
          <div className="d-flex gap-2">
            <Button variant="outline-danger" onClick={handleClear}>
              Clear
            </Button>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
