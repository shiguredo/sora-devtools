import { useSignal } from "@preact/signals";
import type { FunctionComponent } from "preact";
import type { TargetedEvent } from "preact/compat";
import { memo } from "preact/compat";
import { useEffect, useRef } from "preact/hooks";
import { $connectionStatus, $rpcObjects, $sora, clearRpcObjects } from "@/app/store";
import { JSONInputField } from "@/components/DevtoolsPane/JSONInputField.tsx";
import { RPC_TEMPLATES } from "@/constants";
import { rpc } from "@/rpc";
import type { RpcObject } from "@/types";

import { JsonTree } from "./JsonTree.tsx";

const ClearButton = memo(() => {
  const onClick = (): void => {
    clearRpcObjects();
  };
  return (
    <button type="button" className="btn btn-secondary" onClick={onClick}>
      clear
    </button>
  );
});

const RpcForm: FunctionComponent = () => {
  const methodRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<HTMLInputElement>(null);
  const notification = useSignal(false);
  const method = useSignal("");
  const params = useSignal("");
  const paramsHasError = useSignal(false);
  const dropdownOpen = useSignal(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // rpcMethods は sora-js-sdk 2025.2.0 以降で利用可能
  const rpcMethods: string[] =
    ($sora.value as unknown as { rpcMethods?: string[] })?.rpcMethods ?? [];

  // params の JSON パースエラーをチェック
  useEffect(() => {
    if (params.value.trim() === "") {
      paramsHasError.value = false;
      return;
    }
    try {
      JSON.parse(params.value);
      paramsHasError.value = false;
    } catch {
      paramsHasError.value = true;
    }
  }, [params.value, paramsHasError]);

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        dropdownOpen.value = false;
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleCallRpc = async (): Promise<void> => {
    if (
      !methodRef.current ||
      !timeoutRef.current ||
      !$sora.value ||
      $connectionStatus.value !== "connected"
    ) {
      return;
    }

    const method = methodRef.current.value;
    if (!method) {
      return;
    }

    let parsedParams: Record<string, unknown> | undefined;
    const paramsText = params.value.trim();
    if (paramsText) {
      try {
        parsedParams = JSON.parse(paramsText);
      } catch (error) {
        console.error("Invalid JSON in params:", error);
        return;
      }
    }

    const options: { timeout?: number; notification?: boolean } = {};
    const timeoutValue = Number.parseInt(timeoutRef.current.value, 10);
    if (!Number.isNaN(timeoutValue) && timeoutValue > 0) {
      options.timeout = timeoutValue;
    }
    if (notification.value) {
      options.notification = true;
    }

    await rpc($sora.value, method, parsedParams, options);
  };

  return (
    <div className="rpc-form">
      <div className="rpc-form-row">
        <div className="rpc-form-field" style={{ flex: 2 }}>
          <label className="rpc-label">method:</label>
          <div className="rpc-input-group" ref={containerRef}>
            <input
              type="text"
              placeholder="method name"
              ref={methodRef}
              value={method.value}
              onChange={(e: TargetedEvent<HTMLInputElement>) => {
                method.value = e.currentTarget.value;
              }}
            />
            <button
              type="button"
              className="rpc-dropdown-toggle"
              onClick={() => {
                dropdownOpen.value = !dropdownOpen.value;
              }}
              aria-expanded={dropdownOpen.value}
            />
            {dropdownOpen.value && (
              <ul className="rpc-dropdown-menu">
                {RPC_TEMPLATES.map((template) => {
                  const isAvailable = rpcMethods.includes(template.method);
                  return (
                    <li key={template.method}>
                      <button
                        type="button"
                        className={`rpc-dropdown-item ${isAvailable ? "available" : ""}`}
                        onClick={() => {
                          method.value = template.method;
                          if (methodRef.current) {
                            methodRef.current.value = template.method;
                          }
                          if (template.params) {
                            params.value = JSON.stringify(template.params, null, 2);
                          }
                          dropdownOpen.value = false;
                        }}
                      >
                        {template.method}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="rpc-form-field">
          <label className="rpc-label">notification:</label>
          <div className="rpc-checkbox-group">
            <input
              type="checkbox"
              id="rpcNotificationCheck"
              checked={notification.value}
              onChange={(e: TargetedEvent<HTMLInputElement>) => {
                notification.value = e.currentTarget.checked;
              }}
            />
            <label htmlFor="rpcNotificationCheck">送信のみ (レスポンス不要)</label>
          </div>
        </div>

        <div className="rpc-form-field" style={{ flex: 0.5 }}>
          <label className="rpc-label">timeout (ms):</label>
          <input type="number" placeholder="5000" defaultValue="5000" ref={timeoutRef} />
        </div>
      </div>

      <div className="rpc-form-field">
        <label className="rpc-label">params:</label>
        <JSONInputField
          controlId="rpcParams"
          placeholder='{"key": "value"} or ["value1", "value2"]'
          value={params.value}
          setValue={(v) => {
            params.value = v;
          }}
          disabled={false}
          rows={6}
          cols={80}
        />
      </div>

      <div className="rpc-form-actions">
        <button
          type="button"
          className="btn btn-primary rpc-call-btn"
          onClick={handleCallRpc}
          disabled={$connectionStatus.value !== "connected" || paramsHasError.value}
        >
          Call
        </button>
      </div>
    </div>
  );
};

const RpcObjectItem: FunctionComponent<{ rpcObject: RpcObject }> = ({ rpcObject }) => {
  const date = new Date(rpcObject.timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
  const fullTimeString = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}]`;

  return (
    <div className="rpc-result-item">
      <div className="rpc-result-header">
        <span>{fullTimeString}</span>
        {rpcObject.duration !== undefined && <span>{rpcObject.duration.toFixed(2)} ms</span>}
      </div>

      {/* Request */}
      <div className="rpc-result-section">
        <div className="rpc-result-section-title">Request:</div>
        <div className="rpc-result-label">method</div>
        <div className="rpc-result-value">{rpcObject.method}</div>
        {rpcObject.params !== undefined && (
          <>
            <div className="rpc-result-label">params</div>
            <div className="rpc-result-json">
              <JsonTree data={rpcObject.params} />
            </div>
          </>
        )}
        {rpcObject.options !== undefined && (
          <div className="rpc-result-options">
            {rpcObject.options.timeout && `timeout: ${rpcObject.options.timeout} ms`}
            {rpcObject.options.timeout && rpcObject.options.notification && ", "}
            {rpcObject.options.notification && "notification: true"}
          </div>
        )}
      </div>

      {/* Response */}
      {rpcObject.result !== undefined && (
        <div className="rpc-result-section">
          <div className="rpc-result-section-title">Response:</div>
          <div className="rpc-result-label">result</div>
          <div className="rpc-result-json">
            <JsonTree data={rpcObject.result} />
          </div>
        </div>
      )}
      {rpcObject.error !== undefined && (
        <div className="rpc-result-section rpc-result-error">
          <div className="rpc-result-section-title">Error:</div>
          <div className="rpc-result-label">error</div>
          <div className="rpc-result-json">
            <JsonTree data={rpcObject.error} />
          </div>
        </div>
      )}
    </div>
  );
};

export const Rpc: FunctionComponent = () => {
  return (
    <>
      <RpcForm />
      {$rpcObjects.value.length > 0 && (
        <>
          <div className="py-1 mt-3">
            <h5>RPC Results</h5>
            <div className="mb-2" style={{ color: "#aaa", fontSize: "0.85rem" }}>
              {$rpcObjects.value.length} 件を表示
            </div>
            <ClearButton />
          </div>
          <div>
            {$rpcObjects.value.map((rpcObject, index) => {
              const key = `${rpcObject.timestamp}-${index}`;
              return <RpcObjectItem key={key} rpcObject={rpcObject} />;
            })}
          </div>
        </>
      )}
    </>
  );
};
