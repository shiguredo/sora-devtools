// セッション一覧・詳細で使う 3 状態の判定

export type SessionStatus = "ended" | "connected" | "uncertain";

// ended_at と現在の接続試行 ID から表示用の状態を導出する
// 切断済み: ended_at あり / 接続中: ended_at なしかつ current と一致 / それ以外は切断不確定
export function deriveSessionStatus(
  endedAt: string | null,
  sessionDbId: number,
  currentSessionDbId: number | null,
): SessionStatus {
  if (endedAt !== null) {
    return "ended";
  }
  if (currentSessionDbId !== null && currentSessionDbId === sessionDbId) {
    return "connected";
  }
  return "uncertain";
}

// UI 表示用の日本語ラベル
export function sessionStatusLabel(status: SessionStatus): string {
  if (status === "ended") {
    return "切断済み";
  }
  if (status === "connected") {
    return "接続中";
  }
  return "切断不確定";
}
