// フェイク映像生成用 Web Worker
let canvas: OffscreenCanvas | null = null;
let ctx: OffscreenCanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let counter = 0;
let startTime = 0;
let hue = 0;
let baseHue = 0;
let animationPhase = 0;
let frameRate = 30;

// カウンター更新用のインターバル
let counterIntervalId: number | null = null;

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

  // カウンターを中央に大きく表示
  ctx.fillStyle = "white";
  ctx.font = "bold 80px monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(counter.toString(), canvas.width / 2, canvas.height / 2);

  // 経過時間を下部に表示
  const elapsed = Date.now() - startTime;
  ctx.font = "20px Arial";
  ctx.textBaseline = "bottom";
  ctx.fillText(`${elapsed}ms elapsed`, canvas.width / 2, canvas.height - 20);

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

      // 完全にランダムなベース色相を選ぶ
      baseHue = Math.floor(Math.random() * 360);
      hue = baseHue;
      animationPhase = 0;

      // カウンターと開始時刻を初期化
      counter = 0;
      startTime = Date.now();

      // カウンターを 1 ミリ秒ごとに更新
      if (counterIntervalId !== null) {
        clearInterval(counterIntervalId);
      }
      counterIntervalId = self.setInterval(() => {
        counter++;
      }, 1) as unknown as number;

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
      if (counterIntervalId !== null) {
        clearInterval(counterIntervalId);
        counterIntervalId = null;
      }

      // リソースクリーンアップ
      canvas = null;
      ctx = null;

      self.postMessage({ type: "stopped" });
      break;
    }
  }
});

// Worker の型定義をエクスポート
export type FakeVideoWorkerMessage =
  | { type: "init"; data: { canvas: OffscreenCanvas; frameRate?: number } }
  | { type: "stop" }
  | { type: "started" }
  | { type: "stopped" }
  | { type: "error"; error: string };
