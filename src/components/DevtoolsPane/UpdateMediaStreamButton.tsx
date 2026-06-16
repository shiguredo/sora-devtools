import { updateMediaStream } from "@/app/actions";
import { connectionStatus, localMediaStream } from "@/app/signals";
import { Button } from "@/components/ui";

export function UpdateMediaStreamButton() {
  const onClick = (): void => {
    void updateMediaStream();
  };
  // localMediaStream === null: そもそも更新対象が無い (updateMediaStream 冒頭で早期 return される無意味な呼び出し)
  // preparing / connecting / disconnecting: 過渡状態でメディア更新するとレースを誘発する
  // connected は disable しない: 本関数の主用途は接続中のデバイス切替
  const status = connectionStatus.value;
  const disabled =
    localMediaStream.value === null ||
    status === "preparing" ||
    status === "connecting" ||
    status === "disconnecting";
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick} disabled={disabled}>
        update-mediastream
      </Button>
    </div>
  );
}
