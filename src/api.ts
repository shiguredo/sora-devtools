async function post<T>(version: string, path: string, params: Record<string, unknown>): Promise<T> {
  let apiPort = "3000";
  let apiPath = "";
  const protocol = window.location.protocol;
  if (protocol == "https:") {
    apiPort = "443";
    apiPath = "api";
  }
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
