import instructionsJSON from '../instructions.json'

export const MULTISTREAM = ['', 'true', 'false'] as const

export const SIMULCAST = ['', 'true', 'false'] as const

export const SPOTLIGHT = ['', 'true', 'false'] as const

export const AUDIO_CODEC_TYPES = ['', 'OPUS'] as const

export const AUDIO_BIT_RATES = ['', '8', '16', '24', '32', '64', '96', '128', '256'] as const

export const VIDEO_CODEC_TYPES = ['', 'VP8', 'VP9', 'AV1', 'H264', 'H265'] as const

export const VIDEO_BIT_RATES = [
  '',
  '10',
  '30',
  '50',
  '100',
  '300',
  '500',
  '800',
  '1000',
  '1500',
  '2000',
  '2500',
  '3000',
  '5000',
  '10000',
  '15000',
  '20000',
  '30000',
  '50000',
] as const

export const RESOLUTIONS = [
  '',
  '2160p (3840x2160)',
  '1440p (2560x1440)',
  '1080p (1920x1080)',
  '720p (1280x720)',
  '540p (960x540)',
  '480p (720x480)',
  '360p (640x360)',
  '240p (320x240)',
  '144p (256x144)',
] as const

export const DISPLAY_RESOLUTIONS = [
  '',
  '144p (256x144)',
  '240p (320x240)',
  '360p (640x360)',
  '480p (720x480)',
  '540p (960x540)',
  '720p (1280x720)',
  '1080p (1920x1080)',
  '1440p (2560x1440)',
  '2160p (3840x2160)',
] as const

export const FRAME_RATES = ['', '60', '30', '24', '20', '15', '10', '5'] as const

export const AUTO_GAIN_CONTROLS = ['', 'true', 'false'] as const

export const NOISE_SUPPRESSIONS = ['', 'true', 'false'] as const

export const ECHO_CANCELLATIONS = ['', 'true', 'false'] as const

export const ECHO_CANCELLATION_TYPES = ['', 'browser', 'system'] as const

export const MEDIA_TYPES = [
  'getUserMedia',
  'getDisplayMedia',
  'fakeMedia',
  'mediacaptureRegion',
] as const

export const SPOTLIGHT_NUMBERS = ['', '1', '2', '3', '4', '5', '6', '7', '8'] as const

export const SPOTLIGHT_FOCUS_RIDS = ['', 'none', 'r0', 'r1', 'r2'] as const

export const SIMULCAST_RID = ['', 'r0', 'r1', 'r2'] as const

export const DATA_CHANNEL_SIGNALING = ['', 'true', 'false'] as const

export const IGNORE_DISCONNECT_WEBSOCKET = ['', 'true', 'false'] as const

export const DEBUG_TYPES = [
  'log',
  'notify',
  'push',
  'stats',
  'timeline',
  'signaling',
  'messaging',
  'codec',
] as const

export const AUDIO_CONTENT_HINTS = ['', 'speech', 'speech-recognition', 'music'] as const

export const VIDEO_CONTENT_HINTS = ['', 'motion', 'detail', 'text'] as const

export const ASPECT_RATIO_TYPES = ['', '4:3', '16:9', '21:9'] as const

export const RESIZE_MODE_TYPES = ['', 'none', 'crop-and-scale'] as const

export const BLUR_RADIUS = ['', 'weak', 'medium', 'strong'] as const

export const LIGHT_ADJUSTMENT = ['', 'weak', 'medium', 'strong'] as const

export const CONNECTION_STATUS = [
  'initializing',
  'disconnected',
  'disconnecting',
  'connected',
  'connecting',
  'preparing',
] as const

export const ROLES = ['sendrecv', 'sendonly', 'recvonly'] as const

export const FACING_MODES = ['', 'front', 'back'] as const

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
` as const

export const INSTRUCTIONS = instructionsJSON as Record<string, { description: string } | null>
