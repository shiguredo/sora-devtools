# 0038-test-add-sora-independent-ui-tests

- Priority: Medium
- Created: 2026-06-08
- Model: deepseek-v4-pro

## 目的

Sora サーバーに依存せず Playwright だけで完結するブラウザ UI テストを追加し、フォーム操作や URL パラメータ連携、コンポーネントの表示/非表示切り替えなど、アプリケーションの UI レイヤーのリグレッションを防止する。

本 issue のテストは Sora サーバーとの WebRTC 接続を伴わないため e2e テストではない。Playwright を用いたブラウザレベルでの UI テストとして `tests/` に配置する。

## 優先度根拠

現在 `tests/` にあるテストは Sora サーバーが必要な接続テスト（e2e）と遅延ロードテストのみで、サーバーが利用できない環境では Sora 接続テストを実行できない。サーバー不要で実行できる UI テストを追加することで、CI でのテストカバレッジを向上させる。すべての開発者が実行可能であり、価値が高い。

## 現状

- `tests/` には `sendrecv` / `sendonly` / `recvonly` の e2e 接続テストと、`noise-suppression` / `mp4-media-stream` の遅延ロードテストのみ存在する
- URL パラメータがフォームに正しく反映されるかのテストがない（単体テストの `app.test.ts` では `parseQueryString` による signal 値の検証のみ）
- ロール切り替えによる UI の表示/非表示がテストされていない
- Copy URL ボタンのクリップボード連携がテストされていない
- 各種 Collapse セクションの開閉がテストされていない

## 設計方針

`tests/pages/DevtoolsPage.ts`（#0037 で導入）を拡張しつつ、以下の UI テストを追加する。

追加するテスト:

1. **URL パラメータ → フォーム値の反映**
   - `role`, `videoCodecType`, `multistream`, `simulcast`, `spotlight`, `audio`, `video` 等の主要パラメータをクエリ文字列で渡し、対応するフォーム要素に正しく反映されることを検証する
2. **ロール切り替えによる UI の表示/非表示**
   - `sendonly` 時に受信系 UI（`forceStereoOutput`, `spotlight`, `simulcastRid`, `RemoteVideos`）が非表示になること
   - `recvonly` 時に送信系 UI（`AudioForm`, `VideoForm`, `videoCodecType`, `MediaTypeForm`, `RequestMediaButton` 等）が非表示になること
3. **Collapse セクションの開閉**
   - Signaling options / Advanced signaling options / Media options の展開・折りたたみ
   - `enabledOptions` の条件を満たさない場合の折りたたみ状態
4. **Copy URL ボタン**
   - "copy URL" ボタンクリックでクリップボードに URL がコピーされること
   - コピーされた URL に現在の設定がパラメータとして含まれていること
   - ボタンのテキストが "copy URL" → "copied!" に切り替わり、一定時間後に元に戻ること
5. **Media type 切り替え**
   - getUserMedia / fakeMedia / mp4Media のラジオボタン切り替えで対応するフォームが表示/非表示になること

## 完了条件

- 上記 5 つのカテゴリのテストが `tests/` に追加されている
- すべてのテストが Sora サーバーなしで実行可能であること
- `pnpm test:e2e` が全テストを通過すること

## 解決方法

1. `tests/ui-url-params.test.ts` を新規作成（URL パラメータ → フォーム反映）
2. `tests/ui-role-visibility.test.ts` を新規作成（ロール別 UI 表示/非表示）
3. `tests/ui-collapse.test.ts` を新規作成（Collapse 開閉）
4. `tests/ui-copy-url.test.ts` を新規作成（Copy URL ボタン）
5. `tests/ui-media-type.test.ts` を新規作成（Media type 切替）
