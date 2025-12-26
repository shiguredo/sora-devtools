import { Form, FormGroup } from "react-bootstrap";

import { fakeVolume, mediaType, setFakeVolume } from "@/app/signals";

import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

export function FakeVolumeForm() {
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    setFakeVolume(target.value);
  };
  if (mediaType.value !== "fakeMedia") {
    return null;
  }
  return (
    <FormGroup className="form-inline" controlId="fakeVolume">
      <TooltipFormLabel kind="fakeVolume">fakeVolume:</TooltipFormLabel>
      <Form.Range min="0" max="1" step="0.25" value={fakeVolume.value} onChange={onChange} />
    </FormGroup>
  );
}
