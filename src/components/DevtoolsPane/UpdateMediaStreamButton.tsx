import { updateMediaStream } from "@/app/actions";
import { Button } from "@/components/ui";

export function UpdateMediaStreamButton() {
  const onClick = (): void => {
    void updateMediaStream();
  };
  return (
    <div className="col-auto mb-1">
      <Button variant="outline-secondary" onClick={onClick}>
        update-mediastream
      </Button>
    </div>
  );
}
