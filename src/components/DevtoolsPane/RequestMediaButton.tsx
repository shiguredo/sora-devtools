import { requestMedia } from "@/app/actions";
import { isFormDisabled, role, sora } from "@/app/signals";

export function RequestMediaButton() {
  const onClick = (): void => {
    void requestMedia();
  };
  const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-outline-secondary"
        type="button"
        name="media_access"
        defaultValue="request media"
        onClick={onClick}
        disabled={disabled}
      />
    </div>
  );
}
