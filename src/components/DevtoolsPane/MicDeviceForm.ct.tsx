import { afterEach, assert, test, vi } from "vite-plus/test";
import { render } from "vitest-browser-preact";

import { localMediaStream, micDevice, resetState, setMediaType } from "@/app/signals";

import { MicDeviceForm } from "./MicDeviceForm";

const audioContexts: AudioContext[] = [];

function createAudioStream(): MediaStream {
  const audioContext = new AudioContext();
  audioContexts.push(audioContext);
  return audioContext.createMediaStreamDestination().stream;
}

afterEach(async () => {
  for (const audioContext of audioContexts) {
    await audioContext.close();
  }
  audioContexts.length = 0;
  resetState();
});

test("getUserMedia でマイクデバイスを off にすると音声トラックを停止して削除する", async () => {
  setMediaType("getUserMedia");
  const stream = createAudioStream();
  const [audioTrack] = stream.getAudioTracks();
  localMediaStream.value = stream;

  const screen = render(<MicDeviceForm />);
  await screen.getByRole("switch").click();

  await vi.waitFor(
    () => {
      assert.equal(micDevice.value, false);
      assert.equal(audioTrack.readyState, "ended");
      assert.equal(stream.getAudioTracks().length, 0);
    },
    { timeout: 5000 },
  );
});

test("mp4Media でマイクデバイスを off にしても既存の音声トラックを変更しない", async () => {
  setMediaType("mp4Media");
  const stream = createAudioStream();
  const [audioTrack] = stream.getAudioTracks();
  localMediaStream.value = stream;

  const screen = render(<MicDeviceForm />);
  await screen.getByRole("switch").click();

  assert.equal(micDevice.value, false);
  assert.equal(audioTrack.readyState, "live");
  assert.equal(stream.getAudioTracks().length, 1);
});
