import { useSignal } from "@preact/signals";
import type { FunctionComponent } from "preact";

import { $connectionStatus } from "@/app/store";
import { isFormDisabled } from "@/utils";

import { AudioStreamingLanguageCodeForm } from "./AudioStreamingLanguageCodeForm.tsx";
import { BundleIdForm } from "./BundleIdForm.tsx";
import { ClientIdForm } from "./ClientIdForm.tsx";
import { DataChannelSignalingForm, IgnoreDisconnectWebSocketForm } from "./DataChannelForm.tsx";
import { ForceStereoOutputForm } from "./ForceStereoOutputForm.tsx";
import { ForwardingFiltersForm } from "./ForwardingFiltersForm.tsx";
import { MetadataForm } from "./MetadataForm.tsx";
import { SignalingNotifyMetadataForm } from "./SignalingNotifyMetadataForm.tsx";
import { VideoAV1ParamsForm } from "./VideoAV1ParamsForm.tsx";
import { VideoH264ParamsForm } from "./VideoH264ParamsForm.tsx";
import { VideoH265ParamsForm } from "./VideoH265ParamsForm.tsx";
import { VideoVP9ParamsForm } from "./VideoVP9ParamsForm.tsx";

type TabType = "id" | "metadata" | "forwarding" | "advanced";

export const SignalingPanel: FunctionComponent = () => {
  const activeTab = useSignal<TabType>("id");
  const disabled = isFormDisabled($connectionStatus.value);

  const tabClass = (tab: TabType) =>
    `px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
      activeTab.value === tab
        ? "border-blue-500 text-blue-600"
        : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
    }`;

  return (
    <div className="panel-card">
      <h3 className="panel-title">Signaling</h3>
      <div className="space-y-3">
        <div className="flex flex-wrap gap-4">
          <DataChannelSignalingForm disabled={disabled} />
          <IgnoreDisconnectWebSocketForm disabled={disabled} />
        </div>
        <div className="border-t border-slate-200 pt-3">
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              className={tabClass("id")}
              onClick={() => (activeTab.value = "id")}
            >
              ID
            </button>
            <button
              type="button"
              className={tabClass("metadata")}
              onClick={() => (activeTab.value = "metadata")}
            >
              Metadata
            </button>
            <button
              type="button"
              className={tabClass("forwarding")}
              onClick={() => (activeTab.value = "forwarding")}
            >
              Forwarding
            </button>
            <button
              type="button"
              className={tabClass("advanced")}
              onClick={() => (activeTab.value = "advanced")}
            >
              Advanced
            </button>
          </div>
          <div className="py-3">
            {activeTab.value === "id" && (
              <div className="flex flex-col gap-3">
                <ClientIdForm />
                <BundleIdForm />
              </div>
            )}
            {activeTab.value === "metadata" && (
              <div className="flex flex-col gap-3">
                <MetadataForm />
                <SignalingNotifyMetadataForm />
              </div>
            )}
            {activeTab.value === "forwarding" && (
              <div className="flex flex-col gap-3">
                <ForwardingFiltersForm />
              </div>
            )}
            {activeTab.value === "advanced" && (
              <div className="flex flex-col gap-3">
                <AudioStreamingLanguageCodeForm />
                <VideoVP9ParamsForm />
                <VideoAV1ParamsForm />
                <VideoH264ParamsForm />
                <VideoH265ParamsForm />
                <ForceStereoOutputForm />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
