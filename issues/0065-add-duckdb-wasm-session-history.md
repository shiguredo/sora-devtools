# DuckDB-Wasm + OPFS で過去セッションの stats / メタデータを永続化し /sessions ページで確認できるようにする

- Priority: Medium
- Created: 2026-06-24
- Completed: YYYY-MM-DD
- Model: Kimi K2.7 Code
- Polished: 2026-06-24
- 本 issue はエピック。実装作業は #0066 / #0067 / #0068 / #0069 で行うため作業ブランチは切らない

## 目的

現在、sora-devtools は 1 セッションでブラウザを閉じると、webrtc stats / signaling / notify / timeline / log などの接続記録がすべて失われる。過去のセッションを振り返り、統計情報や問題調査に活用できるようにするため、これらの記録をブラウザ内に永続化し、専用ページで確認できるようにする。

## 優先度根拠

Medium。sora-devtools は開発・検証用ツールであり、過去の接続状況を振り返る機能はデバッグ効率を大きく向上させる。ただし、接続機能そのものを阻害しない範囲で段階的に導入する。

## 現状

- WebRTC stats は `src/app/actions.ts` の `setStatsReportInternal()` / `startStatsReportTimer()` で 1 秒間隔に取得され、`signals.statsReport` / `signals.prevStatsReport` に保持される
- signaling / notify / timeline / log / push は `src/app/actions.ts` の `setSoraCallbacks()` 内で SDK イベントを受け取り、それぞれの signal に append-only で保持される
- 既存の OPFS 永続化は `src/opfs.ts` の signaling URL 設定保存のみ
- 既存のエクスポート機能は `src/components/Header/DownloadReportButton.tsx` で現在のセッションを JSON ダウンロードするのみ
- `sessionId` / `connectionId` / `soraClientId` は `handleConnectionCreatedNotify()` で `connection.created` notify 受信後に確定する
- 切断時にこれらの識別子はクリアされ、現在のセッション記録はメモリ上から失われる

## 技術選定

### DuckDB-Wasm を選ぶ理由

- 過去セッションの WebRTC stats をチャンネル・セッション・接続単位で集計・分析する必要がある
- 例: 同一 channelId での過去接続の平均ビットレート、パケットロス率の時系列変化、特定 connection_id の RTT 推移など
- 単なる JSON ファイル保存では、複数セッションにまたがる集計や時系列分析を都度 JavaScript で実装する必要があり、メンテナンスコストが高い
- IndexedDB などのキーバリューストアでは、複雑な集計クエリや window 関数を使った時系列分析が困難
- DuckDB-Wasm はブラウザ上で SQL 集計が可能であり、window 関数、`GROUP BY`、時系列集計などを利用できる
- OPFS と組み合わせることで、stats データをブラウザ内に永続化しつつ、DuckDB のクエリエンジンで高速に集計できる

### OPFS を選ぶ理由

- 永続化データは開発・検証用の接続記録であり、同一ユーザーの端末内に閉じていれば十分
- OPFS は同一オリジン・同一ブラウザプロファイル内のアプリケーションのみアクセスできるため、接続記録を外部サーバーに送信せずに保存できる
- ただし、ブラウザの開発者ツールや同一オリジンで動作する悪意のあるスクリプトからは読み出せるため、絶対的な隔離ではない

## 設計方針

### 全体アーキテクチャ

```
[DevTools] / [Sessions]
       │
       ▼
[src/sessionDatabase.ts]
       │
       ▼
[DuckDB-Wasm AsyncDuckDB]
       │
       ▼
[OPFS: sora-devtools-sessions.db]
```

- `src/sessionDatabase.ts` は DuckDB-Wasm の初期化、テーブル作成、クエリ実行、永続化フックを提供する
- DuckDB-Wasm は `AsyncDuckDB` を使用し、内部 Worker で動作させる
- OPFS 上のデータベースファイル名は `sora-devtools-sessions.db` とし、既存の `signaling-url-candidates.json` と衝突しないようにする

### 永続化対象（段階的導入）

第 1 段階（本 issue 群の対象）:

- `sessions` テーブル: 1 回の Sora 接続試行に紐づくセッション単位のメタデータ
- `connections` テーブル: `connection.created` notify 確定後の接続単位メタデータ
- `webrtc_stats` テーブル: 1 秒間隔で取得される RTCStats

第 2 段階（将来拡張）:

- `timeline_messages` テーブル
- `notify_messages` テーブル
- `signaling_messages` テーブル
- `log_messages` テーブル

### セッション識別子の扱い

- `sessionId` / `connectionId` / `soraClientId` は `connection.created` notify 受信後に確定する
- `sessions` テーブルは「接続試行単位」のレコードとする
  - `connectSora()` または `reconnectSoraImpl()` 開始時に `session_id` を `NULL` とした仮レコードを `INSERT` する
  - `connection.created` notify 受信後に `session_id` を `UPDATE` する（`channel_id` / `role` / `metadata` は `connectSora()` 開始時に既に保存されている）
  - 同じ `session_id` が返された場合でも、新しい接続試行では新しい `sessions` レコードを作成する
  - これにより、SDK の自動 reconnect と手動 reconnect の違いに依存せず、接続試行ごとの started_at / ended_at を正しく記録できる
- `connections` テーブルは `connection_id` ごとに 1 レコード作成する
  - `connection.created` notify 受信後に `INSERT` する
  - 再接続で新しい `connection_id` が発行された場合は新しい `connections` レコードを追加する
- 切断時は、`disconnect` コールバック内で識別子をクリアする前に永続化フックを呼び出し、`sessions.ended_at` / `connections.ended_at` を更新する
- `connection.created` 前に失敗・キャンセルされた接続試行は、`connectSora()` / `reconnectSoraImpl()` 内の `abortIfCancelled()` や例外ハンドラで `sessions.ended_at` を更新する
  - ブラウザ終了等で `ended_at` が更新できなかった場合、`ended_at` が `NULL` のまま残る。これは「切断不確定または接続中の試行」として扱い、`/sessions` 一覧では `ended_at` の有無でフィルタできるようにする

### DuckDB-Wasm 初期化

- npm パッケージ `@duckdb/duckdb-wasm` を使用する。バージョンは stable 版を明示的に指定する
- `AsyncDuckDB` は内部に Worker を作成して動作するため、メインスレッドをブロックしない
- Vite では `selectBundle()` に必要な WASM / Worker ファイルを `?url` import で提供する
  - `@duckdb/duckdb-wasm@1.32.0` の `dist` ディレクトリから以下を `?url` import する
    - `duckdb-eh.wasm`（Extended Hardware バンドルのメイン WASM）
    - `duckdb-browser-eh.worker.js`（Extended Hardware バンドルの Worker）
    - 必要に応じて `duckdb-mvp.wasm` / `duckdb-browser-mvp.worker.js`（Minimum Viable Product バンドル）も `?url` import し、`selectBundle()` に両方登録する
  - 具体例:

    ```ts
    import * as duckdb from "@duckdb/duckdb-wasm";
    import duckdbWasmEh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
    import duckdbWorkerEh from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

    const bundle = await duckdb.selectBundle({
      eh: {
        mainModule: duckdbWasmEh,
        mainWorker: duckdbWorkerEh,
      },
    });
    const worker = new Worker(bundle.mainWorker);
    const logger = new duckdb.ConsoleLogger();
    const db = new duckdb.AsyncDuckDB(logger, worker);
    await db.instantiate(bundle.mainModule);
    ```

  - `vite.config.ts` では `assetsInlineLimit: 0` を設定し、WASM / Worker ファイルが base64 インライン化されないようにする

- 高頻度な stats 書き込みに対して checkpoint を毎回実行するとパフォーマンスが破滅的に低下するため、`SET checkpoint_threshold` はデフォルト値を維持し、明示的な `CHECKPOINT` または正常終了時の close で永続化を確実にする
- 初期化失敗時は、既存の接続・デバッグ機能が動作し続けるようにフォールバックする。`sessionDatabase` の各メソッドは未初期化時に no-op または console warn とする（ログメッセージは英語とする）

### WebRTC stats の保存方針

- 主要な集計・検索フィールドを正規化カラムに展開し、残りを `raw_json` カラムに退避する（詳細は #0068）
- 高頻度な保存に備え、メモリ上でバッファリングし、一定件数または一定間隔でバルク INSERT する

### パフォーマンス・容量方針

- `webrtc_stats` は高頻度に書き込まれるため、必要に応じてインデックスを検討する（詳細は #0068）
- 第 1 段階では以下を採用する
  - `sessions` / `connections` テーブルは件数制限を設けず、全履歴を保持する
  - `webrtc_stats` テーブルは接続ごとに一定件数を超えた場合、古いレコードから間引きまたは削除する
    - 初期方針: 1 接続あたり 10,000 件を上限とし、超過分を 10 件ごとに 1 件の比率でサンプリングして保持する
    - 例: 20,000 件の場合、古い 10,000 件を 1/10 サンプリングして 1,000 件に減らし、新しい 10,000 件は全件保持する
    - 具体的な閾値・サンプリング方式は #0068 の実装時に測定し調整する
- `/sessions` ページでの stats 表示は全件テーブル表示ではなく、集計・ページネーション・時系列サンプリングを組み合わせる
- 将来、保持期間・件数上限・ローテーション方針を別 issue で検討する

### セキュリティ・プライバシー方針

- OPFS は同一オリジン・同一ブラウザプロファイル内のアプリケーションのみアクセスできる
- このため、metadata / signaling URL / SDP / TURN URL などの接続記録を、外部サーバーに送信せずに保存できる
- credentials や API キーなどの高機密情報は永続化対象から除外する。`metadata` にこれらが含まれる場合は保存前にマスクまたは除外する
  - マスク対象の具体例: `api_key` / `apikey` / `apiKey` / `x_api_key` / `x-api-key` / `authorization` / `auth` / `token` / `access_token` / `refresh_token` / `password` / `secret` / `credential` / `credentials` 等のキー名（大文字小文字・スネークケース・ケバブケース・キャメルケースを考慮）
  - 値の型が文字列の場合は `"***"` に置換、オブジェクトの場合は `{"masked": true}` に置換する
  - ネストしたオブジェクト内のキーも再帰的に走査する
  - マスク処理は `src/sessionDatabase.ts` または `src/utils.ts` に実装し、単体テストで検証する
- `local-candidate` / `remote-candidate` 等に含まれる IP アドレス・ポートは接続記録として保存するが、UI 上では「接続記録に端末情報が含まれる」ことを明示する
- ただし、ブラウザの開発者ツールや同一オリジンで動作する悪意のあるスクリプトからは読み出せるため、絶対的な隔離ではない
- UI 上では「データは端末内の OPFS に保存され、外部サーバーには送信されない」ことを明示する
- `shiguredo-no-secrets` スキルの規約に従い、機密情報を含む接続記録の取り扱いを設計に含める

### UI/UX 方針

- Header の `DownloadReportButton` の位置に `Sessions` ボタンを配置する（#0066 / #0069 と連携）
- `/sessions` ページでは以下を提供する
  - 過去セッションの一覧（channelId / sessionId / connectionId / 接続時刻 / 切断時刻 / 状態）
  - セッション詳細（connection メタデータ、webrtc stats 集計・時系列グラフ）
  - webrtc stats 表示は全件テーブルではなく、以下の形式で提供する
    - 集計値（平均ビットレート、総パケット数、パケットロス率、最大 / 最小 / 平均 RTT 等）
    - 時系列サンプリング（1 秒間隔を 10 秒 / 1 分間隔に間引いたデータ）
    - ページネーション付き生データテーブル（必要な場合のみ）
  - クエリストリングによる絞り込み（`sessionId` / `connectionId` / `channelId` / `from` / `to`）
- `/sessions` ページは `preact-iso` で別ページとして実現する（詳細は #0066）

### ルーティング・クエリストリング

- `preact-iso` を導入し、`/` は既存の DevTools、`/sessions` は過去セッション閲覧ページとする（詳細は #0066）
- 既存の `copyURL()` / `setInitialParameter()` は `location.search` / `history.replaceState()` を直接使用しており、`LocationProvider` との同期には #0066 で対応する

## 完了条件

- 0066 / 0067 / 0068 / 0069 の各子 issue が完了していること
- `/sessions` ページで過去セッションの一覧が表示でき、各セッションの詳細で stats を確認できること
- ブラウザを閉じて再度開いても、過去のセッション記録が読み出せること
- 再接続時や同じ channelId での複数接続が正しく区別されて保存されること
- DuckDB-Wasm 初期化失敗・OPFS アクセス不可時でも、既存の接続・デバッグ機能が動作し続けること
- `metadata` 内の機密情報がマスクされて保存されること
- `build` / `test` / `check` が成功すること
- `CHANGES.md` に本エピックに対応する変更履歴が記載されていること
- Sora 接続が必要な E2E テストでは #0063 で導入される `requireSoraConnectionEnv()` を使用し、`E2E_TEST_SORA_SIGNALING_URL` 未設定時は `test.skip()` で skip すること
- E2E テスト間で OPFS 内の `sora-devtools-sessions.db` を削除してクリーンな状態を保つこと

## 解決方法

1. `preact-iso` を導入し、`src/main.tsx` / `src/App.tsx` をルーティング対応に変更する（詳細は #0066）
2. DuckDB-Wasm + OPFS の初期化処理を `src/sessionDatabase.ts` に実装し、`App.tsx` マウント時または `main.tsx` レンダリング後に非同期で初期化する（詳細は #0067）
3. `src/app/actions.ts` / `src/app/signals.ts` のメッセージ追加・stats 更新箇所に永続化フックを追加する（詳細は #0067 / #0068）
4. `src/routes/Sessions.tsx` と `src/components/Sessions/*` を作成し、一覧・詳細・フィルタ UI を実装する
5. WebRTC stats 用の正規化スキーマを定義し、主要カラムを `webrtc_stats` テーブルに保存する（詳細は #0068）
6. `vite.config.ts` / `package.json` で新規外部依存（`@duckdb/duckdb-wasm`、`preact-iso`）に関する必要な設定を行う
   - `vite.config.ts` では `build.assetsInlineLimit: 0` を設定し、DuckDB-Wasm の WASM / Worker ファイルが base64 インライン化されないようにする
   - `.pnpmfile.cjs` は依存関係に問題が発生した場合のみ調整する（詳細は #0067）
   - 現状の最新版はいずれも `minimumReleaseAge` の制約に引っかからないため、`pnpm-workspace.yaml` の `minimumReleaseAgeExclude` への追記は不要
7. Playwright E2E テストで DuckDB-Wasm + OPFS の読み書きを検証する

## テスト方針

- Vitest 単体テスト: `RTCStats` の正規化関数、`sessionDatabase` のクエリビルダーなど、ブラウザ API に依存しない純粋関数を対象とする
- Playwright E2E テスト: DuckDB-Wasm + OPFS の初期化、接続時の `sessions` / `connections` レコード作成、切断時の `ended_at` 更新、stats の保存と読み出しを検証する
- E2E テストでは OPFS へのアクセスを `navigator.storage.getDirectory()` 経由で検証する
- E2E テスト間で OPFS 内のデータが残らないよう、各テスト終了時に DuckDB-Wasm の接続を close し、OPFS 上の `sora-devtools-sessions.db` を削除する

## リスクと対策

| リスク                                                                | 対策                                                                                                                                                                                                                  |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DuckDB-Wasm 初期化失敗で既存機能が動かなくなる                        | 初期化は非同期で行い、失敗時は永続化をスキップして既存機能を継続する                                                                                                                                                  |
| OPFS quota 不足で書き込み失敗                                         | エラーをキャッチし、UI 上でユーザーに通知する。将来の issue でローテーション方針を検討する                                                                                                                            |
| 高頻度な stats 書き込みで UI がカクつく                               | `AsyncDuckDB` の内部 Worker を使用し、バッチ挿入を行う                                                                                                                                                                |
| 識別子確定前のデータが紐付けできない                                  | 一時バッファで管理し、確定後にまとめて INSERT する                                                                                                                                                                    |
| `preact-iso` 導入で既存のクエリストリング処理が壊れる                 | #0066 で `copyURL()` 実行後に `useLocation().route()` で同期する                                                                                                                                                      |
| `/sessions` 遷移中に Sora 接続が切断される                            | #0066 で `DevTools.tsx` の cleanup から `disconnectSora()` を削除し、`beforeunload` イベントリスナーに移す                                                                                                            |
| `beforeunload` 内で `disconnectSora()` の非同期処理が完了しない       | ブラウザ終了時は切断完了を保証できない。次回起動時に `ended_at` が NULL の古いレコードを「切断不確定」として表示する                                                                                                  |
| OPFS ファイル破損                                                     | 正常終了時（`beforeunload` またはページ終了処理）に DuckDB-Wasm の接続を close し、切断時・定期的（例: 1 分ごと）に明示的な `CHECKPOINT` を実行する。破損時は DB ファイルを削除して再作成するフォールバックを検討する |
| `metadata` 内の機密情報が OPFS に残る                                 | 保存前にマスク処理を行い、単体テストで検証する                                                                                                                                                                        |
| `local-candidate` / `remote-candidate` の IP アドレス等が OPFS に残る | 第 1 段階では `raw_json` に含めて保存し、UI 上で明示する                                                                                                                                                              |

## 未解決課題

- `@duckdb/duckdb-wasm` / `apache-arrow` の `.pnpmfile.cjs` 調整内容は #0067 の PoC で確定する
  - `@duckdb/duckdb-wasm@1.32.0` は `apache-arrow: ^17.0.0` を direct dependency として持つ。pnpm が自動的に `apache-arrow` をインストールするため、基本的に `.pnpmfile.cjs` への追記は不要

## 関連 issue

- #0066: preact-iso を導入して `/sessions` ページへのルーティング基盤を追加する
- #0067: DuckDB-Wasm + OPFS でセッション・接続メタデータを永続化する
- #0068: WebRTC stats を DuckDB-Wasm + OPFS に永続化する
- #0069: DownloadReportButton と DownloadReport 関連機能を削除する
