import { SimulcastRid, SpotlightFocusRid } from 'sora-js-sdk'

async function post(
  apiUrl: null | string,
  version: string,
  path: string,
  params: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const protocol = window.location.protocol
  const apiPort = protocol === 'https:' ? '443' : '3000'
  const apiPath = protocol === 'https:' ? 'api' : ''
  let url = `${protocol}//${window.location.hostname}:${apiPort}/${apiPath}`
  if (apiUrl !== null) {
    url = apiUrl
  }
  const target = `Sora_${version}.${path}`
  const response = await fetch(url, {
    method: 'POST',
    body: JSON.stringify(params),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'x-sora-target': target,
    },
    mode: 'cors',
  })
  const responseJson = await response.json()
  if (!response.ok) {
    let errorMessage = `POST ${url} ${response.status} (${response.statusText}) target:${target}`
    if (responseJson.error_type) {
      errorMessage += ` error_type: ${responseJson.error_type}`
    }
    const error = new Error(errorMessage)
    throw error
  }
  return responseJson
}

export function startRec(apiUrl: null | string, channelId: string): Promise<unknown> {
  const params = { channel_id: channelId, expire_time: 3600 }
  return post(apiUrl, '20231220', 'StartRecording', params)
}

export function stopRec(apiUrl: null | string, channelId: string): Promise<unknown> {
  const params = { channel_id: channelId }
  return post(apiUrl, '20231220', 'StopRecording', params)
}

export function requestRtpStream(
  apiUrl: null | string,
  channelId: string,
  recvConnectionId: string,
  rid: SimulcastRid,
  sendConnectionId?: string,
): Promise<unknown> {
  const params: {
    channel_id: string
    recv_connection_id: string
    send_connection_id?: string
    rid: SimulcastRid
  } = {
    channel_id: channelId,
    recv_connection_id: recvConnectionId,
    rid: rid,
  }
  if (sendConnectionId) {
    params.send_connection_id = sendConnectionId
  }
  return post(apiUrl, '20201005', 'RequestRtpStream', params)
}

export function resetRtpStream(
  apiUrl: null | string,
  channelId: string,
  connectionId: string,
  sendConnectionId?: string,
): Promise<unknown> {
  const params: { channel_id: string; recv_connection_id: string; send_connection_id?: string } = {
    channel_id: channelId,
    recv_connection_id: connectionId,
  }
  if (sendConnectionId) {
    params.send_connection_id = sendConnectionId
  }
  return post(apiUrl, '20201005', 'ResetRtpStream', params)
}

export function requestSpotlightRid(
  apiUrl: null | string,
  channelId: string,
  recvConnectionId: string,
  spotlightFocursRid: SpotlightFocusRid,
  spotlightUnfocursRid: SpotlightFocusRid,
  sendConnectionId?: string,
): Promise<unknown> {
  const params: {
    channel_id: string
    recv_connection_id: string
    send_connection_id?: string
    spotlight_focus_rid: SpotlightFocusRid
    spotlight_unfocus_rid: SpotlightFocusRid
  } = {
    channel_id: channelId,
    recv_connection_id: recvConnectionId,
    spotlight_focus_rid: spotlightFocursRid,
    spotlight_unfocus_rid: spotlightUnfocursRid,
  }
  if (sendConnectionId) {
    params.send_connection_id = sendConnectionId
  }
  return post(apiUrl, '20211215', 'RequestSpotlightRid', params)
}

export function resetSpotlightRid(
  apiUrl: null | string,
  channelId: string,
  connectionId: string,
  sendConnectionId?: string,
): Promise<unknown> {
  const params: { channel_id: string; recv_connection_id: string; send_connection_id?: string } = {
    channel_id: channelId,
    recv_connection_id: connectionId,
  }
  if (sendConnectionId) {
    params.send_connection_id = sendConnectionId
  }
  return post(apiUrl, '20211215', 'ResetSpotlightRid', params)
}
