import { SimulcastQuality } from "sora-js-sdk";

async function post<T>(version: string, path: string, params: Record<string, unknown>): Promise<T> {
  const protocol = window.location.protocol;
  const apiPort = protocol == "https:" ? "443" : "3000";
  const apiPath = protocol == "https:" ? "api" : "";
  const target = `Sora_${version}.${path}`;
  const url = `${protocol}//${window.location.hostname}:${apiPort}/${apiPath}`;
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(params),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-sora-target": target,
    },
    mode: "cors",
  });
  if (response.status !== 200) {
    const error = new Error(response.statusText);
    throw error;
  }
  return response.json();
}

export function startRec(channelId: string): void {
  const params = { channel_id: channelId, expire_time: 3600 };
  post("20161101", "StartRecording", params);
}

export function stopRec(channelId: string): void {
  const params = { channel_id: channelId };
  post("20161101", "StopRecording", params);
}

export function changeSimulcastQuality(
  channelId: string,
  connectionId: string,
  quality: SimulcastQuality,
  streamId?: string
): void {
  const params: { channel_id: string; connection_id: string; stream_id?: string; quality: SimulcastQuality } = {
    channel_id: channelId,
    connection_id: connectionId,
    quality: quality,
  };
  if (streamId) {
    params["stream_id"] = streamId;
  }
  post("20180820", "ChangeSimulcastQuality", params);
}

export function resetSimulcastQuality(channelId: string, connectionId: string, streamId?: string): void {
  const params: { channel_id: string; connection_id: string; stream_id?: string } = {
    channel_id: channelId,
    connection_id: connectionId,
  };
  if (streamId) {
    params["stream_id"] = streamId;
  }
  post("20200807", "ResetSpotlightQuality", params);
}
