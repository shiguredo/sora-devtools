import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

import { FormCheck, FormGroup } from "@/components/ui";

import { setMediaType } from "@/app/actions";
import { isFormDisabled, localMediaStream, mediaType } from "@/app/signals";
import { MEDIA_TYPES } from "@/constants";
import { checkFormValue } from "@/utils";

import { Mp4MediaStream } from "@shiguredo/mp4-media-stream";
import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

interface FormRadioProps {
  label: string;
  mediaTypeValue: string;
  disabled: boolean;
  onChange: (event: Event) => void;
}
function FormRadio(props: FormRadioProps) {
  const { label, disabled, onChange, mediaTypeValue } = props;
  return (
    <FormCheck
      type="radio"
      id={label}
      label={label}
      checked={mediaTypeValue === label}
      onChange={(e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.checked) {
          const syntheticEvent = new Event("change");
          Object.defineProperty(syntheticEvent, "target", { value: { value: label } });
          onChange(syntheticEvent);
        }
      }}
      disabled={disabled}
    />
  );
}

export function MediaTypeForm() {
  // NOTE(yuito): window.CropTarget の有無のみで radio の表示/非表示を切り替えると
  // サーバサイドとクライアントサイドのレンダリング結果の不一致で warning が発生するため
  // mount してから表示するハックを入れる
  const mountClient = useSignal(false);
  const disabled = localMediaStream.value !== null || isFormDisabled.value;
  const enabledMp4Media = Mp4MediaStream.isSupported();
  const onChange = (event: Event): void => {
    const target = event.target as HTMLInputElement;
    if (checkFormValue(target.value, MEDIA_TYPES)) {
      setMediaType(target.value);
    }
  };
  useEffect(() => {
    mountClient.value = true;
  }, [mountClient]);
  return (
    <FormGroup className="flex items-center gap-2 flex-wrap">
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
      {mountClient.value && (
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
