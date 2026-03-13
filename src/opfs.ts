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

// OPFS から URL エントリを読み込む
export async function loadUrlEntries(): Promise<UrlEntry[]> {
  try {
    // OPFS がサポートされているか確認
    if (!navigator.storage?.getDirectory) {
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
    // OPFS がサポートされているか確認
    if (!navigator.storage?.getDirectory) {
      return;
    }

    const root = await navigator.storage.getDirectory();
    await root.removeEntry(SETTINGS_FILE_NAME);
  } catch {
    // ファイルが存在しない場合は無視
  }
}
