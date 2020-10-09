import { SimulcastQuality } from "sora-js-sdk";

async function post(version: string, path: string, params: Record<string, unknown>): Promise<Record<string, unknown>> {
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
  const responseJson = await response.json();
  if (!response.ok) {
    let errorMessage = `POST ${url} ${response.status} (${response.statusText}) target:${target}`;
    if (responseJson.error_type) {
      errorMessage += ` error_type: ${responseJson.error_type}`;
    }
    const error = new Error(errorMessage);
    throw error;
  }
  return responseJson;
}

export function startRec(channelId: string): Promise<unknown> {
  const params = { channel_id: channelId, expire_time: 3600 };
  return post("20161101", "StartRecording", params);
}

export function stopRec(channelId: string): Promise<unknown> {
  const params = { channel_id: channelId };
  return post("20161101", "StopRecording", params);
}

export function changeSimulcastQuality(
  channelId: string,
  connectionId: string,
  quality: SimulcastQuality,
  streamId?: string
): Promise<unknown> {
  const params: { channel_id: string; connection_id: string; stream_id?: string; quality: SimulcastQuality } = {
    channel_id: channelId,
    connection_id: connectionId,
    quality: quality,
  };
  if (streamId) {
    params["stream_id"] = streamId;
  }
  return post("20180820", "ChangeSimulcastQuality", params);
}

export function requestSpotlightQuality(
  channelId: string,
  connectionId: string,
  quality: SimulcastQuality,
  streamId?: string
): Promise<unknown> {
  const params: { channel_id: string; connection_id: string; stream_id?: string; quality: SimulcastQuality } = {
    channel_id: channelId,
    connection_id: connectionId,
    quality: quality,
  };
  if (streamId) {
    params["stream_id"] = streamId;
  }
  return post("20200807", "RequestSpotlightQuality", params);
}

export function resetSpotlightQuality(channelId: string, connectionId: string, streamId?: string): Promise<unknown> {
  const params: { channel_id: string; connection_id: string; stream_id?: string } = {
    channel_id: channelId,
    connection_id: connectionId,
  };
  if (streamId) {
    params["stream_id"] = streamId;
  }
  return post("20200807", "ResetSpotlightQuality", params);
}
