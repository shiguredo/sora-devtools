// Origin Private File System (OPFS) を使用した設定の永続化
// Safari では createWritable() がサポートされていないため、
// createSyncAccessHandle() を使用する Worker 経由のアプローチが必要だが、
// シンプルさを優先して Safari では File System Access API を使用する

const SETTINGS_FILE_NAME = "signaling-url-candidates.json";

export type UrlEntry = {
  url: string;
  enabled: boolean;
};

export type SignalingUrlCandidatesSettings = {
  urlEntries: UrlEntry[];
};

// OPFS から URL エントリを読み込む
export async function loadUrlEntriesFromOPFS(): Promise<UrlEntry[]> {
  try {
    // OPFS がサポートされているか確認
    if (!navigator.storage || !navigator.storage.getDirectory) {
      console.warn("OPFS is not supported in this browser");
      return [];
    }

    const root = await navigator.storage.getDirectory();
    const fileHandle = await root.getFileHandle(SETTINGS_FILE_NAME, { create: false });
    const file = await fileHandle.getFile();
    const text = await file.text();
    const settings = JSON.parse(text) as SignalingUrlCandidatesSettings;

    if (Array.isArray(settings.urlEntries)) {
      return settings.urlEntries;
    }

    return [];
  } catch {
    // ファイルが存在しない場合やパースエラーの場合は空配列を返す
    return [];
  }
}

// OPFS に URL エントリを保存する
export async function saveUrlEntriesToOPFS(urlEntries: UrlEntry[]): Promise<void> {
  try {
    // OPFS がサポートされているか確認
    if (!navigator.storage || !navigator.storage.getDirectory) {
      console.warn("OPFS is not supported in this browser");
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
    } else {
      // Safari の古いバージョンでは OPFS への書き込みがメインスレッドからできない
      // この場合は localStorage にフォールバック
      localStorage.setItem("sora-devtools-signaling-url-candidates", content);
    }
  } catch (error) {
    console.error("Failed to save urlEntries to OPFS:", error);
    // フォールバックとして localStorage に保存
    try {
      const settings: SignalingUrlCandidatesSettings = {
        urlEntries,
      };
      localStorage.setItem("sora-devtools-signaling-url-candidates", JSON.stringify(settings));
    } catch {
      // localStorage も失敗した場合は諦める
    }
  }
}

// OPFS から設定ファイルを削除する
export async function purgeUrlEntriesFromOPFS(): Promise<void> {
  try {
    // OPFS がサポートされているか確認
    if (!navigator.storage || !navigator.storage.getDirectory) {
      console.warn("OPFS is not supported in this browser");
      return;
    }

    const root = await navigator.storage.getDirectory();
    await root.removeEntry(SETTINGS_FILE_NAME);
  } catch {
    // ファイルが存在しない場合は無視
  }

  // localStorage のフォールバックも削除
  try {
    localStorage.removeItem("sora-devtools-signaling-url-candidates");
  } catch {
    // 無視
  }
}

// localStorage からのフォールバック読み込み
export function loadUrlEntriesFromLocalStorage(): UrlEntry[] {
  try {
    const stored = localStorage.getItem("sora-devtools-signaling-url-candidates");
    if (stored) {
      const settings = JSON.parse(stored) as SignalingUrlCandidatesSettings;
      if (Array.isArray(settings.urlEntries)) {
        return settings.urlEntries;
      }
    }
  } catch {
    // パースエラーの場合は無視
  }
  return [];
}

// OPFS から読み込み、失敗した場合は localStorage から読み込む
export async function loadUrlEntries(): Promise<UrlEntry[]> {
  const fromOPFS = await loadUrlEntriesFromOPFS();
  if (fromOPFS.length > 0) {
    return fromOPFS;
  }
  return loadUrlEntriesFromLocalStorage();
}
