// フェイク映像生成用 Web Worker
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let startTime = 0;
let startDateTime = "";
let hue = 0;
let baseHue = 0;
let animationPhase = 0;
let frameRate = 30;
let channelId: string | null = null;
let sessionId: string | null = null;
let connectionId: string | null = null;

// 描画関数
function drawFrame(): void {
  if (!ctx || !canvas) return;

  // 背景をグラデーションで描画
  // アニメーションで彩度と明度も少し変化させる
  const saturation = 70 + Math.sin(animationPhase * 0.7) * 5; // 65-75%
  const lightness1 = 50 + Math.sin(animationPhase * 0.5) * 5; // 45-55%
  const lightness2 = 40 + Math.sin(animationPhase * 0.5) * 5; // 35-45%

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness1}%)`);
  gradient.addColorStop(1, `hsl(${hue + 15}, ${saturation}%, ${lightness2}%)`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 上部に開始日時を表示
  if (startDateTime) {
    const dateSize = Math.min(canvas.width, canvas.height) * 0.05;
    ctx.fillStyle = "white";
    ctx.font = `${dateSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(startDateTime, canvas.width / 2, canvas.height * 0.05);
  }

  // 経過時間を mmmm:ss.SSS 形式で中央に表示
  const elapsed = Date.now() - startTime;
  const minutes = Math.floor(elapsed / 60000);
  const seconds = Math.floor((elapsed % 60000) / 1000);
  const milliseconds = elapsed % 1000;
  const text = `${minutes.toString().padStart(4, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
  // 基本フォントサイズを解像度から計算し、桁数に応じて縮小
  const baseSize = Math.min(canvas.width, canvas.height) * 0.15;
  const maxChars = 11; // "0000:00.000" = 11文字
  const fontSize = text.length > maxChars ? baseSize * (maxChars / text.length) : baseSize;
  ctx.fillStyle = "white";
  ctx.font = `bold ${fontSize}px monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);

  // 下部に channel_id / session_id / connection_id を1行で表示
  const infoParts: string[] = [];
  if (channelId) {
    const truncated = channelId.length > 10 ? `${channelId.slice(0, 10)}...` : channelId;
    infoParts.push(truncated);
  }
  if (sessionId) infoParts.push(sessionId);
  if (connectionId) infoParts.push(connectionId);

  if (infoParts.length > 0) {
    const infoSize = Math.min(canvas.width, canvas.height) * 0.04;
    ctx.fillStyle = "white";
    ctx.font = `${infoSize}px monospace`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(infoParts.join(" / "), canvas.width / 2, canvas.height * 0.95);
  }

  // アニメーションフェーズを進める（ベース色から±10度の範囲で振動）
  animationPhase += 0.02;
  hue = baseHue + Math.sin(animationPhase) * 10;
}

// 指定されたフレームレートでアニメーションループ
function animate(): void {
  drawFrame();
  // Worker 内では setTimeout を使用（requestAnimationFrame は使えない）
  const interval = Math.floor(1000 / frameRate);
  animationId = self.setTimeout(() => animate(), interval) as unknown as number;
}

// メッセージハンドラー
self.addEventListener("message", (event: MessageEvent) => {
  const { type, data } = event.data;

  switch (type) {
    case "init": {
      // OffscreenCanvas を受け取って初期化
      canvas = data.canvas as OffscreenCanvas;
      ctx = canvas.getContext("2d", { alpha: false });

      if (!ctx) {
        self.postMessage({ type: "error", error: "Failed to get 2D context" });
        return;
      }

      // フレームレートを設定
      if (data.frameRate !== undefined) {
        frameRate = data.frameRate;
      }

      // channel_id を設定
      if (data.channelId !== undefined) {
        channelId = data.channelId as string;
      }

      // 完全にランダムなベース色相を選ぶ
      baseHue = Math.floor(Math.random() * 360);
      hue = baseHue;
      animationPhase = 0;

      // 開始時刻を記録
      startTime = Date.now();
      const now = new Date(startTime);
      startDateTime = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}-${now.getDate().toString().padStart(2, "0")} ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;

      // アニメーション開始
      animate();

      self.postMessage({ type: "started" });
      break;
    }

    case "stop": {
      // アニメーション停止
      if (animationId !== null) {
        clearTimeout(animationId);
        animationId = null;
      }

      // リソースクリーンアップ
      canvas = null;
      ctx = null;
      channelId = null;
      sessionId = null;
      connectionId = null;
      startDateTime = "";

      self.postMessage({ type: "stopped" });
      break;
    }

    case "setMetadata": {
      if (data.channelId !== undefined) channelId = data.channelId as string | null;
      if (data.sessionId !== undefined) sessionId = data.sessionId as string | null;
      if (data.connectionId !== undefined) connectionId = data.connectionId as string | null;
      break;
    }
  }
});

// Worker の型定義をエクスポート
export type FakeVideoWorkerMessage =
  | { type: "init"; data: { canvas: OffscreenCanvas; frameRate?: number; channelId?: string } }
  | { type: "stop" }
  | {
      type: "setMetadata";
      data: { channelId?: string | null; sessionId?: string | null; connectionId?: string | null };
    }
  | { type: "started" }
  | { type: "stopped" }
  | { type: "error"; error: string };
