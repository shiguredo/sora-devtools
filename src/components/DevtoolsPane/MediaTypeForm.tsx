import { useEffect, useState } from "react";
import { FormCheck, FormGroup } from "react-bootstrap";

import { setMediaType } from "@/app/actions";
import { isFormDisabled, localMediaStream, mediaType } from "@/app/signals";
import { MEDIA_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { Mp4MediaStream } from "@shiguredo/mp4-media-stream";
import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

type FormRadioProps = {
  label: string;
  mediaTypeValue: string;
  disabled: boolean;
  onChange: (event: Event) => void;
};
function FormRadio(props: FormRadioProps) {
  const { label, disabled, onChange, mediaTypeValue } = props;
  return (
    <FormCheck
      type="radio"
      inline={true}
      id={label}
      label={label}
      value={label}
      checked={mediaTypeValue === label}
      onChange={onChange}
      disabled={disabled}
    />
  );
}

export function MediaTypeForm() {
  // NOTE(yuito): window.CropTarget の有無のみで radio の表示/非表示を切り替えると
  // サーバサイドとクライアントサイドのレンダリング結果の不一致で warning が発生するため
  // mount してから表示するハックを入れる
  const [mountClient, setMountClient] = useState(false);
  const disabled = localMediaStream.value !== null || isFormDisabled.value;
  const enabledMp4Media = Mp4MediaStream.isSupported();
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    if (checkFormValue(target.value, MEDIA_TYPES)) {
      setMediaType(target.value);
    }
  };
  useEffect(() => {
    setMountClient(true);
  }, []);
  return (
    <FormGroup className="form-inline flex-wrap">
      <TooltipFormLabel kind="mediaType">mediaType:</TooltipFormLabel>
      <FormRadio
        label="getUserMedia"
        mediaTypeValue={mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      <FormRadio
        label="getDisplayMedia"
        mediaTypeValue={mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      <FormRadio
        label="fakeMedia"
        mediaTypeValue={mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      {mountClient && (
        <FormRadio
          label="mp4Media"
          mediaTypeValue={mediaType.value}
          disabled={disabled || !enabledMp4Media}
          onChange={onChange}
        />
      )}
    </FormGroup>
  );
}
