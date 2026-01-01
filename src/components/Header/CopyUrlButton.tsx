import { copyURL } from "@/app/actions";
import { Button } from "@/components/ui";

export function CopyUrlButton() {
  const onClick = (): void => {
    copyURL();
  };
  return (
    <Button variant="light" size="sm" className="ml-1" onClick={onClick}>
      copy URL
    </Button>
  );
}
