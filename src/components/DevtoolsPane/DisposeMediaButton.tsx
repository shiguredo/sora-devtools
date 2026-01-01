import { disposeMedia } from "@/app/actions";
import { isFormDisabled, role, sora } from "@/app/signals";
import { Button } from "@/components/ui";

export function DisposeMediaButton() {
  const onClick = (): void => {
    void disposeMedia();
  };
  const disabled = role.value === "recvonly" || sora.value !== null || isFormDisabled.value;
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick} disabled={disabled}>
        dispose media
      </Button>
    </div>
  );
}
