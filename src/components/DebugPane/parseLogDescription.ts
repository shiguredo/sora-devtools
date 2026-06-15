// Log メッセージの description 表示用に受け取った文字列を安全にパースする型
export type LogDescription = string | number | Record<string, unknown> | unknown[];

// description 表示用に raw 文字列を安全にパースする。
// 異常系経路（getErrorMessage の素文字列等）が混入しても render を落とさないように try/catch で防御する。
// JSON として有効でも、Message.tsx で表示できない型（null / boolean）は raw 文字列に fallback する。
export function parseLogDescription(raw: string): LogDescription {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    // JSON として無効な素文字列はそのまま返す
    return raw;
  }
  if (typeof parsed === "string" || typeof parsed === "number") {
    return parsed;
  }
  if (Array.isArray(parsed)) {
    // Array.isArray は any[] までしか narrow しないため unknown[] にキャストする
    return parsed as unknown[];
  }
  if (parsed !== null && typeof parsed === "object") {
    return parsed as Record<string, unknown>;
  }
  // null / boolean は Message.tsx の <pre> 表示で意味のある描画ができないため raw 文字列に落とす
  return raw;
}
