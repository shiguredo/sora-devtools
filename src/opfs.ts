// Origin Private File System (OPFS) を使用した設定の永続化
// Safari では createWritable() がサポートされていないため、
// createSyncAccessHandle() を使用する Worker 経由のアプローチが必要だが、
// シンプルさを優先して Safari では File System Access API を使用する

const SETTINGS_FILE_NAME = "signaling-url-candidates.json";

export interface UrlEntry {
  url: string;
  enabled: boolean;
}

export interface SignalingUrlCandidatesSettings {
  urlEntries: UrlEntry[];
}

// UrlEntry の構造 ({ url: string; enabled: boolean }) を実行時に検証する型ガード。
// JSON.parse 経由で取得した任意形状の値に対し、url が string・enabled が boolean であることを確認する。
export function isUrlEntry(value: unknown): value is UrlEntry {
  return (
    typeof value === "object" &&
    value !== null &&
    "url" in value &&
    typeof value.url === "string" &&
    "enabled" in value &&
    typeof value.enabled === "boolean"
  );
}

// OPFS から読んだテキストを UrlEntry[] にパース・検証する純粋関数。
// JSON.parse の戻り値は実行時には任意の形状を取り得るため、SignalingUrlCandidatesSettings キャストは
// 型上の偽装に過ぎない。urlEntries の各要素の url / enabled 構造を isUrlEntry で実行時に検証し、
// 不正な要素を 1 つでも含む場合は全体を空配列に落とす。
// 部分救済しない理由は、ユーザーが「自分の登録した URL が消えた」状態を SignalingUrlModal の
// 未登録状態として明確に観測できるようにするため。
export function parseUrlEntriesFromText(text: string): UrlEntry[] {
  let settings: unknown;
  try {
    settings = JSON.parse(text);
  } catch {
    return [];
  }
  if (
    typeof settings === "object" &&
    settings !== null &&
    "urlEntries" in settings &&
    Array.isArray(settings.urlEntries) &&
    settings.urlEntries.every(isUrlEntry)
  ) {
    return settings.urlEntries;
  }
  return [];
}

// OPFS から URL エントリを読み込む
export async function loadUrlEntries(): Promise<UrlEntry[]> {
  try {
    // OPFS がサポートされているか確認 (lib.dom 上は常に存在するが古い Safari 等で undefined になり得る)
    // oxlint-disable-next-line typescript/no-unnecessary-condition
    if (!navigator.storage?.getDirectory) {
      return [];
    }

    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(SETTINGS_FILE_NAME, { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    return parseUrlEntriesFromText(text);
  } catch {
    // OPFS API 呼び出しでファイルが存在しない / ハンドル取得失敗等の例外を握りつぶす
    // (パースエラーは parseUrlEntriesFromText 内で吸収済み)
    return [];
  }
}

// OPFS に URL エントリを保存する
export async function saveUrlEntriesToOPFS(urlEntries: UrlEntry[]): Promise<void> {
  try {
    // OPFS がサポートされているか確認 (lib.dom 上は常に存在するが古い Safari 等で undefined になり得る)
    // oxlint-disable-next-line typescript/no-unnecessary-condition
    if (!navigator.storage?.getDirectory) {
      return;
    }

    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(SETTINGS_FILE_NAME, { create: true });

    const settings: SignalingUrlCandidatesSettings = {
      urlEntries,
    };
    const content = JSON.stringify(settings, null, 2);

    // Safari では createWritable() がサポートされていないため、
    // createSyncAccessHandle() を使う (ただし Worker 内でのみ利用可能)
    // メインスレッドでは createWritable() を試み、失敗した場合は
    // Safari 向けに blob を使った代替手段を試みる
    if ("createWritable" in fileHandle) {
      try {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
        return;
      } catch {
        // createWritable() が失敗した場合は代替手段を試みる
      }
    }

    // Safari 向けの代替手段: File を再作成する
    // Safari 15.2+ では OPFS はサポートされているが createWritable() はサポートされていない
    // この場合、ファイルを削除して新規作成する方法を使う
    try {
      await root.removeEntry(SETTINGS_FILE_NAME);
    } catch {
      // ファイルが存在しない場合は無視
    }

    // 新しいファイルを作成
    const newFileHandle = await root.getFileHandle(SETTINGS_FILE_NAME, { create: true });

    // Safari 17.4+ では createWritable() がサポートされている
    if ("createWritable" in newFileHandle) {
      const writable = await newFileHandle.createWritable();
      await writable.write(content);
      await writable.close();
    }
    // OPFS への書き込みがサポートされていない場合は何もしない
  } catch {
    // OPFS への保存に失敗した場合は何もしない
  }
}

// OPFS から設定ファイルを削除する
export async function purgeUrlEntriesFromOPFS(): Promise<void> {
  try {
    // OPFS がサポートされているか確認 (lib.dom 上は常に存在するが古い Safari 等で undefined になり得る)
    // oxlint-disable-next-line typescript/no-unnecessary-condition
    if (!navigator.storage?.getDirectory) {
      return;
    }

    const root = await navigator.storage.getDirectory();
    await root.removeEntry(SETTINGS_FILE_NAME);
  } catch {
    // ファイルが存在しない場合は無視
  }
}
