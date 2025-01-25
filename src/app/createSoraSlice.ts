// import type { CONNECTION_STATUS } from '@/constants'
// import { createSignalingURL } from '@/utils'
// import type { ConnectionPublisher, ConnectionSubscriber } from 'sora-js-sdk'
// import type { StateCreator } from 'zustand'
//
// export type SoraSlice = {
//   connectionStatus: (typeof CONNECTION_STATUS)[number]
//   sora: ConnectionPublisher | ConnectionSubscriber | null
//
//   setSoraConnectionStatus: (connectionStatus: (typeof CONNECTION_STATUS)[number]) => void
//   setSora: (sora: ConnectionPublisher | ConnectionSubscriber | null) => void
//
//   connectSora: () => void
//   disconnectSora: () => void
// }
//
// export const createSoraSlice: StateCreator<SoraSlice> = (set, get) => ({
//   connectionStatus: 'initializing',
//   sora: null,
//
//   setSoraConnectionStatus: (connectionStatus) => {
//     set({ connectionStatus })
//   },
//
//   setSora: (sora) => {
//     set({ sora })
//   },
//
//   connectSora: async () => {
//     const state = get()
//     state.setSoraConnectionStatus('preparing')
//     // 強制的に state.soraContents.localMediaStream を作り直すかどうか
//     let forceCreateMediaStream = false
//     // 接続中の場合は切断する
//     if (state.sora && state.connectionStatus === 'disconnected') {
//       await state.sora.disconnect()
//       // 接続中の再接続の場合は、MediaStream を作り直し、state.soraContents.localMediaStream を更新する
//       forceCreateMediaStream = true
//     }
//     // シグナリング候補のURLリストを作成する
//     const signalingUrlCandidates = createSignalingURL(
//       state.enabledSignalingUrlCandidates,
//       state.signalingUrlCandidates,
//     )
//     // 他の Slice のメソッドを呼び出せる
//     state.setLogMessages({
//       title: 'SIGNALING_URL',
//       description: JSON.stringify(signalingUrlCandidates),
//     })
//   },
//   disconnectSora: async () => {
//     const { sora, connectionStatus, setSoraConnectionStatus } = get()
//     if (sora && connectionStatus === 'connected') {
//       setSoraConnectionStatus('disconnecting')
//       await sora.disconnect()
//       setSoraConnectionStatus('disconnected')
//     }
//   },
// })
//
