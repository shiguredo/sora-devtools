// /sessions ページ専用のクエリストリング読み書き
// DevTools の signals には書き込まない

export interface SessionsSearchParams {
  sessionId?: string;
  connectionId?: string;
  channelId?: string;
  from?: string;
  to?: string;
  sessionDbId?: number;
}

const DATE_ONLY_PATTERN = /^(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})$/u;

// YYYY-MM-DD として厳密に解釈できるか（月日の妥当性も確認する）
export function isValidDateOnly(value: string): boolean {
  const match = DATE_ONLY_PATTERN.exec(value);
  if (match?.groups === undefined) {
    return false;
  }
  const year = Number(match.groups.year);
  const month = Number(match.groups.month);
  const day = Number(match.groups.day);
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return false;
  }
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  // UTC で Date を組み立て、丸められていないか確認する
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

// from が to より後なら不正
function isFromAfterTo(from: string, to: string): boolean {
  return from > to;
}

// 正の整数（sessionDbId）として解釈できるか
export function parseSessionDbId(raw: string | null): number | undefined {
  if (raw === null || raw === "") {
    return undefined;
  }
  if (!/^\d+$/u.test(raw)) {
    return undefined;
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 1) {
    return undefined;
  }
  return value;
}

// location.search または URLSearchParams から Sessions 用パラメータを読む
// 不正な from/to/sessionDbId は未指定扱い（呼び出し側で QS 正規化してよい）
export function parseSessionsSearchParams(search: string | URLSearchParams): SessionsSearchParams {
  let params: URLSearchParams;
  if (typeof search === "string") {
    const normalized = search.startsWith("?") ? search.slice(1) : search;
    params = new URLSearchParams(normalized);
  } else {
    params = search;
  }

  const result: SessionsSearchParams = {};

  const sessionId = params.get("sessionId");
  if (sessionId !== null && sessionId !== "") {
    result.sessionId = sessionId;
  }

  const connectionId = params.get("connectionId");
  if (connectionId !== null && connectionId !== "") {
    result.connectionId = connectionId;
  }

  const channelId = params.get("channelId");
  if (channelId !== null && channelId !== "") {
    result.channelId = channelId;
  }

  const from = params.get("from");
  const to = params.get("to");
  let validFrom: string | undefined;
  let validTo: string | undefined;
  if (from !== null && isValidDateOnly(from)) {
    validFrom = from;
  }
  if (to !== null && isValidDateOnly(to)) {
    validTo = to;
  }
  if (validFrom !== undefined && validTo !== undefined && isFromAfterTo(validFrom, validTo)) {
    validFrom = undefined;
    validTo = undefined;
  }
  if (validFrom !== undefined) {
    result.from = validFrom;
  }
  if (validTo !== undefined) {
    result.to = validTo;
  }

  const sessionDbId = parseSessionDbId(params.get("sessionDbId"));
  if (sessionDbId !== undefined) {
    result.sessionDbId = sessionDbId;
  }

  return result;
}

// Sessions 用パラメータから URLSearchParams を組み立てる（空値は載せない）
export function buildSessionsSearchParams(params: SessionsSearchParams): URLSearchParams {
  const search = new URLSearchParams();
  if (params.sessionId !== undefined && params.sessionId !== "") {
    search.set("sessionId", params.sessionId);
  }
  if (params.connectionId !== undefined && params.connectionId !== "") {
    search.set("connectionId", params.connectionId);
  }
  if (params.channelId !== undefined && params.channelId !== "") {
    search.set("channelId", params.channelId);
  }
  if (params.from !== undefined && isValidDateOnly(params.from)) {
    search.set("from", params.from);
  }
  if (params.to !== undefined && isValidDateOnly(params.to)) {
    search.set("to", params.to);
  }
  // from > to なら両方載せない
  const fromValue = search.get("from");
  const toValue = search.get("to");
  if (fromValue !== null && toValue !== null && isFromAfterTo(fromValue, toValue)) {
    search.delete("from");
    search.delete("to");
  }
  if (
    params.sessionDbId !== undefined &&
    Number.isSafeInteger(params.sessionDbId) &&
    params.sessionDbId >= 1
  ) {
    search.set("sessionDbId", String(params.sessionDbId));
  }
  return search;
}

// /sessions への path + search 文字列を組み立てる
export function buildSessionsPath(params: SessionsSearchParams): string {
  const search = buildSessionsSearchParams(params);
  const query = search.toString();
  if (query === "") {
    return "/sessions";
  }
  return `/sessions?${query}`;
}
