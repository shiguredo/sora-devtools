import { requestMedia } from "@/app/actions";
import { isFormDisabled, role, sora } from "@/app/signals";
import { Button } from "@/components/ui";

export function RequestMediaButton() {
  const onClick = (): void => {
    void requestMedia();
  };
  const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick} disabled={disabled}>
        request media
      </Button>
    </div>
  );
}
