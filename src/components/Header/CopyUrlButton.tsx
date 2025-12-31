import { copyURL } from "@/app/actions";

export function CopyUrlButton() {
  const onClick = (): void => {
    copyURL();
  };
  return (
    <input
      className="btn btn-light btn-sm ml-1"
      type="button"
      name="copyUrl"
      defaultValue="copy URL"
      onClick={onClick}
    />
  );
}
