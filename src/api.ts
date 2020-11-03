import { SimulcastRid } from "sora-js-sdk";

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

export function requestRtpStream(
  channelId: string,
  recvConnectionId: string,
  rid: SimulcastRid,
  sendConnectionId?: string
): Promise<unknown> {
  const params: { channel_id: string; recvConnectionId: string; sendConnectionId?: string; rid: SimulcastRid } = {
    channel_id: channelId,
    recv_connection_id: recvConnectionId,
    rid: rid,
  };
  if (sendConnectionId) {
    params["send_connection_id"] = sendConnectionId;
  }
  return post("20201005", "RequestRtpStream", params);
}

export function resetRtpStream(channelId: string, connectionId: string, streamId?: string): Promise<unknown> {
  const params: { channel_id: string; connection_id: string; stream_id?: string } = {
    channel_id: channelId,
    connection_id: connectionId,
  };
  if (streamId) {
    params["stream_id"] = streamId;
  }
  return post("20201005", "ResetRtpStream", params);
}
