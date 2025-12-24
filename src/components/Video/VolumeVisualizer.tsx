import React, { useEffect, useRef } from "react";

const CANVAS_WIDTH = 25 as const;
const MARGIN = 2.5 as const;
const BAR_HEIGHT = 10 as const;
const VOLUME_BAR_BACKGROUND_COLOR = "#CCCCCC" as const;
const VOLUME_BAR_FOREGROUND_COLOR = "#000000" as const;

function createVolumeRect(ctx: CanvasRenderingContext2D, style: string, rectY: number): void {
  ctx.beginPath();
  ctx.fillStyle = style;
  ctx.fillRect(0, rectY, CANVAS_WIDTH, BAR_HEIGHT);
  ctx.closePath();
}

function createVolumeBackground(ctx: CanvasRenderingContext2D, height: number): void {
  const barRenderCount = Math.ceil(height / (BAR_HEIGHT + MARGIN));
  let remainingHeight = height - BAR_HEIGHT;
  createVolumeRect(ctx, VOLUME_BAR_BACKGROUND_COLOR, remainingHeight);
  for (let i = 0; i < barRenderCount; i++) {
    remainingHeight = remainingHeight - BAR_HEIGHT - MARGIN;
    createVolumeRect(ctx, VOLUME_BAR_BACKGROUND_COLOR, remainingHeight);
  }
}

function createVolumeForeground(
  ctx: CanvasRenderingContext2D,
  canvasHeight: number,
  rms: number,
): void {
  const fillHeight = canvasHeight * rms;
  const barRenderCount = Math.ceil(fillHeight / (BAR_HEIGHT + MARGIN));
  for (let i = 0; i < barRenderCount; i++) {
    const y = canvasHeight - BAR_HEIGHT * (i + 1) - MARGIN * i;
    createVolumeRect(ctx, VOLUME_BAR_FOREGROUND_COLOR, y);
  }
}

type VisualizerProps = {
  micDevice: boolean;
  stream: MediaStream;
  height: number;
};
const Visualizer = React.memo<VisualizerProps>((props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (props.stream.getAudioTracks().length === 0) {
      return;
    }
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioContext = new AudioContext();
    const mediaStreamSource = audioContext.createMediaStreamSource(props.stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    mediaStreamSource.connect(analyser);

    let animationFrameId: number | null = null;
    function draw(): void {
      animationFrameId = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      const array = Array.from(dataArray);
      // dataArray の最低値が 128 のため、最小値を 0 にする
      const currentVolume = Math.max.apply(null, array) - 128;
      const canvas = canvasRef.current;
      if (canvas === null) {
        return;
      }
      const ctx = canvas.getContext("2d");
      if (ctx === null) {
        return;
      }
      ctx.clearRect(0, 0, CANVAS_WIDTH, canvas.height);
      ctx.save();
      // 背景のバーをレンダリングする
      createVolumeBackground(ctx, canvas.height);
      // 前景のバーをレンダリングする
      createVolumeForeground(ctx, canvas.height, currentVolume / 128);
      ctx.restore();
    }
    draw();
    return () => {
      if (audioContext) {
        void audioContext.close();
      }
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [props.stream]);
  return (
    <canvas
      width={CANVAS_WIDTH}
      height={props.height}
      className="volume-visualizer"
      ref={canvasRef}
    />
  );
});

type MutedVisualizerProps = {
  height: number;
};
const MutedVisualizer = React.memo<MutedVisualizerProps>((props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      return;
    }
    ctx.clearRect(0, 0, CANVAS_WIDTH, canvas.height);
    ctx.save();
    // 背景のバーをレンダリングする
    createVolumeBackground(ctx, canvas.height);
    ctx.restore();
  }, []);
  return (
    <canvas
      width={CANVAS_WIDTH}
      height={props.height}
      className="volume-visualizer"
      ref={canvasRef}
    />
  );
});

export const VolumeVisualizer = React.memo<VisualizerProps>((props) => {
  if (props.micDevice && props.stream.getAudioTracks().length > 0) {
    return <Visualizer {...props} />;
  }
  return <MutedVisualizer {...props} />;
});
