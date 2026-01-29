import { useSignal } from "@preact/signals";

import type { CustomHTMLCanvasElement } from "@/types";

const CODECS = ["VP8", "VP9", "AV1", "H.264", "H.265"] as const;

const SCALABILITY_MODES = [
  // L系 (Inter-layer dependency: Yes)
  "L1T1",
  "L1T2",
  "L1T3",
  "L2T1",
  "L2T2",
  "L2T3",
  "L3T1",
  "L3T2",
  "L3T3",
  // Lh系 (1.5:1 ratio)
  "L2T1h",
  "L2T2h",
  "L2T3h",
  "L3T1h",
  "L3T2h",
  "L3T3h",
  // S系 (Inter-layer dependency: No)
  "S2T1",
  "S2T2",
  "S2T3",
  "S2T1h",
  "S2T2h",
  "S2T3h",
  "S3T1",
  "S3T2",
  "S3T3",
  "S3T1h",
  "S3T2h",
  "S3T3h",
  // KEY系
  "L2T2_KEY",
  "L2T2_KEY_SHIFT",
  "L2T3_KEY",
  "L2T3_KEY_SHIFT",
  "L3T1_KEY",
  "L3T2_KEY",
  "L3T2_KEY_SHIFT",
  "L3T3_KEY",
  "L3T3_KEY_SHIFT",
] as const;

type CheckStatus = "unchecked" | "checking" | "supported" | "unsupported" | "error";
type CheckState = "idle" | "running" | "completed";
type ScalabilityModeResults = {
  [codec: string]: {
    [mode: string]: CheckStatus;
  };
};

// コーデック名から MIME タイプへのマッピング
function getCodecMimeType(codec: string): string {
  switch (codec) {
    case "VP8":
      return "video/VP8";
    case "VP9":
      return "video/VP9";
    case "AV1":
      return "video/AV1";
    case "H.264":
      return "video/H264";
    case "H.265":
      return "video/H265";
    default:
      return `video/${codec}`;
  }
}

// ダミービデオトラック作成関数
function createDummyVideoTrack(): { track: MediaStreamTrack; cleanup: () => void } {
  const canvas = document.createElement("canvas") as CustomHTMLCanvasElement;
  canvas.width = 320;
  canvas.height = 240;
  const stream = canvas.captureStream(30);
  const track = stream.getVideoTracks()[0];
  return {
    track,
    cleanup: () => stream.getTracks().forEach((t) => t.stop()),
  };
}

// RTCRtpSender.getCapabilities から指定コーデックを検索
function findCodecCapability(codecName: string): RTCRtpCodec | null {
  const capabilities = RTCRtpSender.getCapabilities("video");
  if (!capabilities) {
    return null;
  }
  const mimeType = getCodecMimeType(codecName).toLowerCase();
  return capabilities.codecs.find((c) => c.mimeType.toLowerCase() === mimeType) ?? null;
}

// ローカル 1:1 接続を確立して ScalabilityMode サポートをチェックする関数
async function checkScalabilityModeSupport(
  codec: string,
  mode: string,
): Promise<{ supported: boolean; error?: string }> {
  const codecCapability = findCodecCapability(codec);
  if (!codecCapability) {
    return { supported: false, error: `codec ${codec} not found in capabilities` };
  }

  const localPc = new RTCPeerConnection();
  const remotePc = new RTCPeerConnection();
  const { track, cleanup } = createDummyVideoTrack();

  try {
    // ICE candidate の交換
    localPc.onicecandidate = (event) => {
      if (event.candidate) {
        void remotePc.addIceCandidate(event.candidate);
      }
    };
    remotePc.onicecandidate = (event) => {
      if (event.candidate) {
        void localPc.addIceCandidate(event.candidate);
      }
    };

    // localPc にトラックを追加
    const sender = localPc.addTrack(track);

    // コーデックを設定
    const transceivers = localPc.getTransceivers();
    const transceiver = transceivers.find((t) => t.sender === sender);
    if (transceiver) {
      transceiver.setCodecPreferences([codecCapability]);
    }

    // offer/answer の交換
    const offer = await localPc.createOffer();
    await localPc.setLocalDescription(offer);
    await remotePc.setRemoteDescription(offer);

    const answer = await remotePc.createAnswer();
    await remotePc.setLocalDescription(answer);
    await localPc.setRemoteDescription(answer);

    // SDP ネゴシエーション完了後に scalabilityMode を設定
    const parameters = sender.getParameters();
    if (parameters.encodings.length === 0) {
      parameters.encodings = [{}];
    }

    // @ts-ignore: scalabilityMode は標準には存在しないが、ブラウザによってはサポートしている
    parameters.encodings[0].scalabilityMode = mode;

    await sender.setParameters(parameters);

    // setParameters 後に getParameters で実際に反映されているか確認
    // Safari など一部ブラウザは setParameters が成功しても scalabilityMode を無視する
    const updatedParameters = sender.getParameters();
    // @ts-ignore: scalabilityMode は標準には存在しないが、ブラウザによってはサポートしている
    const actualMode = updatedParameters.encodings[0]?.scalabilityMode;
    if (actualMode !== mode) {
      return {
        supported: false,
        error: `scalabilityMode not applied: expected ${mode}, got ${actualMode}`,
      };
    }

    return { supported: true };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    return { supported: false, error: errorMessage };
  } finally {
    localPc.close();
    remotePc.close();
    cleanup();
  }
}

// ステータスに応じた背景色クラスを返す
// 色覚異常に配慮した Okabe-Ito パレットを使用
function getStatusBgClass(status: CheckStatus): string {
  switch (status) {
    case "unchecked":
      return "bg-gray-600";
    case "checking":
      return "bg-a11y-yellow text-black";
    case "supported":
      return "bg-a11y-bluish-green";
    case "unsupported":
      return "bg-a11y-vermilion";
    case "error":
      return "bg-a11y-reddish-purple";
    default:
      return "bg-gray-600";
  }
}

// ステータスに応じたラベルを返す
function getStatusLabel(status: CheckStatus): string {
  switch (status) {
    case "unchecked":
      return "-";
    case "checking":
      return "...";
    case "supported":
      return "OK";
    case "unsupported":
      return "NG";
    case "error":
      return "ERR";
    default:
      return "-";
  }
}

// 結果の初期状態を生成
function createInitialResults(): ScalabilityModeResults {
  const results: ScalabilityModeResults = {};
  for (const codec of CODECS) {
    results[codec] = {};
    for (const mode of SCALABILITY_MODES) {
      results[codec][mode] = "unchecked";
    }
  }
  return results;
}

// ScalabilityMode サポートチェックコンポーネント
export function ScalabilityMode() {
  const checkState = useSignal<CheckState>("idle");
  const results = useSignal<ScalabilityModeResults>(createInitialResults());

  const runCheck = async () => {
    checkState.value = "running";
    const newResults = createInitialResults();

    // 全ての組み合わせを checking に設定
    for (const codec of CODECS) {
      for (const mode of SCALABILITY_MODES) {
        newResults[codec][mode] = "checking";
      }
    }
    results.value = { ...newResults };

    // 各コーデックと scalabilityMode の組み合わせをチェック
    for (const codec of CODECS) {
      for (const mode of SCALABILITY_MODES) {
        const result = await checkScalabilityModeSupport(codec, mode);
        if (result.supported) {
          newResults[codec][mode] = "supported";
        } else if (result.error?.includes("not found")) {
          newResults[codec][mode] = "error";
        } else {
          newResults[codec][mode] = "unsupported";
        }
        results.value = { ...newResults };
      }
    }

    checkState.value = "completed";
  };

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-bold">ScalabilityMode Support</span>
        <button
          type="button"
          onClick={runCheck}
          disabled={checkState.value === "running"}
          className={`
            px-2 py-1 text-sm rounded border
            font-normal leading-normal text-center
            transition-colors duration-150
            ${
              checkState.value === "running"
                ? "text-gray-400 bg-gray-500 border-gray-500 cursor-not-allowed"
                : "text-black bg-bs-light border-bs-light hover:bg-[#e2e6ea] hover:border-[#dae0e5] cursor-pointer"
            }
          `}
        >
          {checkState.value === "running" ? "Checking..." : "Check Support"}
        </button>
      </div>
      <table className="w-full text-sm text-white border-collapse table-fixed">
        <thead>
          <tr className="bg-dark">
            <th className="border border-light p-1 text-left w-28">Mode</th>
            {CODECS.map((codec) => (
              <th key={codec} className="border border-light p-1 text-center w-16">
                {codec}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SCALABILITY_MODES.map((mode) => (
            <tr key={mode}>
              <td className="border border-light p-1 font-mono">{mode}</td>
              {CODECS.map((codec) => {
                const status = results.value[codec][mode];
                return (
                  <td
                    key={`${codec}-${mode}`}
                    className={`border border-light p-1 text-center text-white ${getStatusBgClass(status)}`}
                  >
                    {getStatusLabel(status)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
