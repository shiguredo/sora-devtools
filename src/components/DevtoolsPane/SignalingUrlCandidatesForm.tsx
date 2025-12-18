import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";

import { setEnabledSignalingUrlCandidates, setSignalingUrlCandidates } from "@/app/actions";
import {
  $connectionStatus,
  $enabledSignalingUrlCandidates,
  $signalingUrlCandidates,
} from "@/app/store";
import { FormRow } from "@/components/Form";
import { isFormDisabled } from "@/utils";

import { TooltipFormCheck } from "./TooltipFormCheck.tsx";

export const SignalingUrlCandidatesForm: FunctionComponent = () => {
  const disabled = isFormDisabled($connectionStatus.value);
  const onChangeSwitch = (event: TargetedEvent<HTMLInputElement>): void => {
    setEnabledSignalingUrlCandidates(event.currentTarget.checked);
  };
  const onChangeText = (event: TargetedEvent<HTMLTextAreaElement>): void => {
    setSignalingUrlCandidates(event.currentTarget.value.split("\n"));
  };
  const textareaPlaceholder = `signalingUrlCandidatesを指定
(例)
wss://sora0.example.com/signaling
wss://sora1.example.com/signaling
`;
  return (
    <>
      <FormRow>
        <TooltipFormCheck
          kind="signalingUrlCandidates"
          checked={$enabledSignalingUrlCandidates.value}
          onChange={onChangeSwitch}
          disabled={disabled}
        >
          signalingUrlCandidates
        </TooltipFormCheck>
      </FormRow>
      {$enabledSignalingUrlCandidates.value ? (
        <textarea
          placeholder={textareaPlaceholder}
          value={$signalingUrlCandidates.value.join("\n")}
          onChange={onChangeText}
          rows={5}
          cols={100}
          disabled={disabled}
          className="w-full px-3 py-1.5 text-base border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
        />
      ) : null}
    </>
  );
};
