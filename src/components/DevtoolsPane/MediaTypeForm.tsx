import { useSignal } from "@preact/signals";
import { Mp4MediaStream } from "@shiguredo/mp4-media-stream";

import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";
import { useEffect } from "preact/hooks";
import { setMediaType } from "@/app/actions";
import { $connectionStatus, $localMediaStream, $mediaType } from "@/app/store";
import { FormRow } from "@/components/Form";
import { MEDIA_TYPES } from "@/constants";
import { checkFormValue, isFormDisabled } from "@/utils";
import { TooltipFormLabel } from "./TooltipFormLabel.tsx";

type FormRadioProps = {
  label: string;
  mediaType: string;
  disabled: boolean;
  onChange: (event: TargetedEvent<HTMLInputElement>) => void;
};
const FormRadio: FunctionComponent<FormRadioProps> = (props) => {
  const { label, disabled, onChange, mediaType } = props;
  return (
    <div className="inline-flex items-center gap-1">
      <input
        type="radio"
        id={label}
        value={label}
        checked={mediaType === label}
        onChange={onChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-white border-slate-300 focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
      />
      <label className="cursor-pointer text-sm" htmlFor={label}>
        {label}
      </label>
    </div>
  );
};

export const MediaTypeForm: FunctionComponent = () => {
  // NOTE(yuito): window.CropTarget の有無のみで radio の表示/非表示を切り替えると
  // サーバサイドとクライアントサイドのレンダリング結果の不一致で warning が発生するため
  // mount してから表示するハックを入れる
  const mountClient = useSignal(false);
  const disabled = $localMediaStream.value !== null || isFormDisabled($connectionStatus.value);
  const enabledMp4Media = Mp4MediaStream.isSupported();
  const onChange = (event: TargetedEvent<HTMLInputElement>): void => {
    if (checkFormValue(event.currentTarget.value, MEDIA_TYPES)) {
      setMediaType(event.currentTarget.value);
    }
  };
  useEffect(() => {
    mountClient.value = true;
  }, [mountClient]);
  return (
    <FormRow className="flex-wrap">
      <TooltipFormLabel kind="mediaType">mediaType:</TooltipFormLabel>
      <FormRadio
        label="getUserMedia"
        mediaType={$mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      <FormRadio
        label="getDisplayMedia"
        mediaType={$mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      <FormRadio
        label="fakeMedia"
        mediaType={$mediaType.value}
        disabled={disabled}
        onChange={onChange}
      />
      {mountClient.value && (
        <FormRadio
          label="mp4Media"
          mediaType={$mediaType.value}
          disabled={disabled || !enabledMp4Media}
          onChange={onChange}
        />
      )}
    </FormRow>
  );
};
