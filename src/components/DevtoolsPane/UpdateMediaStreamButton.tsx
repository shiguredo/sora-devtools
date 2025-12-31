import { updateMediaStream } from "@/app/actions";

export function UpdateMediaStreamButton() {
  const onClick = (): void => {
    void updateMediaStream();
  };
  return (
    <div className="col-auto mb-1">
      <input
        className="btn btn-outline-secondary"
        type="button"
        name="update-mediastream"
        defaultValue="update-mediastream"
        onClick={onClick}
      />
    </div>
  );
}
