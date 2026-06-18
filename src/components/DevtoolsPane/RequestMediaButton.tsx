import { requestMedia } from "@/app/actions";
import { isFormDisabled, localMediaStream, role, sora } from "@/app/signals";
import { Button } from "@/components/ui";

export function RequestMediaButton() {
  const onClick = (): void => {
    void requestMedia();
  };
  // recvonly: 送信メディア不要なので request 不要
  // sora !== null: 接続済みは UpdateMediaStreamButton で更新するため request 不要
  // localMediaStream !== null: 既に取得済みなので重複取得を防ぐ
  // isFormDisabled: connecting / preparing / connected の同期防止
  const disabled =
    role.value === "recvonly" ||
    sora.value !== null ||
    localMediaStream.value !== null ||
    isFormDisabled.value;
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick} disabled={disabled}>
        request media
      </Button>
    </div>
  );
}
