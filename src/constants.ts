export const AUDIO_CODEC_TYPES = ["", "OPUS"] as const;

export const AUDIO_BIT_RATES = ["", "8", "16", "24", "32", "64", "96", "128", "256"] as const;

export const VIDEO_CODEC_TYPES = ["", "VP8", "VP9", "H264", "H265", "AV1"] as const;

export const VIDEO_BIT_RATES = [
  "",
  "10",
  "30",
  "50",
  "100",
  "300",
  "500",
  "800",
  "1000",
  "1500",
  "2000",
  "2500",
  "3000",
  "5000",
  "10000",
  "15000",
  "20000",
  "30000",
  "50000",
] as const;

export const RESOLUTIONS = [
  "",
  "UHD 4096x2160",
  "UHD 3840x2160",
  "3840x1920",
  "FHD",
  "HD",
  "VGA",
  "QVGA",
  "HQVGA",
  "QCIF",
  "QQVGA",
] as const;

export const DISPLAY_RESOLUTIONS = ["", "VGA", "QVGA"] as const;

export const FRAME_RATES = ["", "60", "30", "24", "20", "15", "10"] as const;

export const ECHO_CANCELLATION_TYPES = ["", "browser", "system"] as const;

export const MEDIA_TYPES = ["getUserMedia", "getDisplayMedia", "fakeMedia"] as const;

export const SPOTLIGHTS = ["1", "2", "3", "4", "5", "6", "7", "8", "true"] as const;

export const SPOTLIGHT_NUMBERS = ["", "1", "2", "3", "4", "5", "6", "7", "8"] as const;

export const SPOTLIGHT_FOCUS_RIDS = ["", "none", "r0", "r1", "r2"] as const;

export const SIMULCAST_RID = ["", "r0", "r1", "r2"] as const;

export const DATA_CHANNEL_SIGNALING = ["", "true", "false"] as const;

export const IGNORE_DISCONNECT_WEBSOCKET = ["", "true", "false"] as const;

export const WORKER_SCRIPT = `
self.onmessage = (event) => {
  const data = event.data;
  if (data.type === "start") {
    const interval = data.interval;
    self.counter = 0;
    const intervalId = setInterval(() => {
      const message = { type: "update", counter: self.counter };
      self.postMessage(message);
      self.counter++;
    }, interval);
    self.intervalId = intervalId;
  } else if (data.type === "stop") {
    if (self.intervalId) {
      clearInterval(self.intervalId);
    }
    const message = { type: "stop" };
    self.postMessage(message);
  }
};
` as const;
