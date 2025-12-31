import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

import { InputGroup, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "@/components/ui";

import { clearRpcObjects } from "@/app/actions";
import { connectionStatus, rpcObjects, sora } from "@/app/signals";
import { RPC_TEMPLATES } from "@/constants";
import { rpc } from "@/rpc";
import type { RpcObject } from "@/types";
import { JSONInputField } from "@/components/DevtoolsPane/JSONInputField.tsx";

import { JsonTree } from "./JsonTree.tsx";

function ClearButton() {
  const onClick = (): void => {
    clearRpcObjects();
  };
  return (
    <input
      className="btn btn-secondary"
      type="button"
      name="clear"
      defaultValue="clear"
      onClick={onClick}
    />
  );
}

function RpcForm() {
  const methodRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<HTMLInputElement>(null);
  const notification = useSignal(false);
  const method = useSignal("");
  const params = useSignal("");
  const paramsHasError = useSignal(false);

  const conn = sora.value;
  const connectionStatusValue = connectionStatus.value;
  // rpcMethods は sora-js-sdk 2025.2.0 以降で利用可能
  const rpcMethods: string[] = (conn as unknown as { rpcMethods?: string[] })?.rpcMethods ?? [];

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

  const handleCallRpc = async (): Promise<void> => {
    if (
      !methodRef.current ||
      !timeoutRef.current ||
      !conn ||
      connectionStatusValue !== "connected"
    ) {
      return;
    }

    const methodValue = methodRef.current.value;
    if (!methodValue) {
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

    await rpc(conn, methodValue, parsedParams, options);
  };

  return (
    <div className="mt-2">
      <div className="mb-2 flex gap-2">
        <div style={{ width: "600px" }}>
          <div className="mb-1" style={{ color: "#fff" }}>
            <strong>method:</strong>
          </div>
          <InputGroup>
            <input
              type="text"
              placeholder="method name"
              ref={methodRef}
              value={method.value}
              onChange={(e) => {
                method.value = (e.target as HTMLInputElement).value;
              }}
              className="block w-full px-3 py-1.5 text-base leading-normal text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
            />
            <Dropdown>
              <DropdownToggle variant="outline-secondary" />
              <DropdownMenu className="right-0 max-h-80 overflow-y-auto">
                {RPC_TEMPLATES.map((template) => {
                  const isAvailable = rpcMethods.includes(template.method);
                  return (
                    <DropdownItem
                      key={template.method}
                      onClick={() => {
                        method.value = template.method;
                        if (methodRef.current) {
                          methodRef.current.value = template.method;
                        }
                        if (template.params) {
                          params.value = JSON.stringify(template.params, null, 2);
                        }
                      }}
                      className={isAvailable ? "!text-blue-600 !font-bold" : ""}
                    >
                      {template.method}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
          </InputGroup>
        </div>

        <div style={{ width: "250px" }}>
          <div className="mb-1" style={{ color: "#fff" }}>
            <strong>notification:</strong>
          </div>
          <div className="form-check" style={{ paddingTop: "0.5rem" }}>
            <input
              className="form-check-input"
              type="checkbox"
              id="rpcNotificationCheck"
              checked={notification.value}
              onChange={(e) => {
                notification.value = (e.target as HTMLInputElement).checked;
              }}
            />
            <label
              className="form-check-label"
              htmlFor="rpcNotificationCheck"
              style={{ color: "#fff" }}
            >
              送信のみ (レスポンス不要)
            </label>
          </div>
        </div>

        <div style={{ width: "150px" }}>
          <div className="mb-1" style={{ color: "#fff" }}>
            <strong>timeout (ms):</strong>
          </div>
          <input
            type="number"
            placeholder="5000"
            defaultValue="5000"
            ref={timeoutRef}
            className="block w-full px-3 py-1.5 text-base leading-normal text-gray-900 bg-white border border-gray-300 rounded-md focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
          />
        </div>
      </div>

      <div className="mb-2">
        <div className="mb-1" style={{ color: "#fff" }}>
          <strong>params:</strong>
        </div>
        <JSONInputField
          controlId="rpcParams"
          placeholder='{"key": "value"} or ["value1", "value2"]'
          value={params.value}
          setValue={(value: string) => {
            params.value = value;
          }}
          disabled={false}
          rows={6}
          cols={80}
        />
      </div>

      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={handleCallRpc}
          disabled={connectionStatusValue !== "connected" || paramsHasError.value}
          className="px-8 py-3 text-xl font-bold bg-gray-600 text-white border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Call
        </button>
      </div>
    </div>
  );
}

function RpcObjectItem({ rpcObject }: { rpcObject: RpcObject }) {
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
    <div className="mb-3 p-3 border rounded" style={{ backgroundColor: "#1a1a1a", color: "#fff" }}>
      <div className="mb-3 flex justify-between" style={{ color: "#ccc" }}>
        <small>{fullTimeString}</small>
        {rpcObject.duration !== undefined && <small>{rpcObject.duration.toFixed(2)} ms</small>}
      </div>

      {/* Request */}
      <div className="mb-3">
        <div className="mb-2" style={{ color: "#fff", fontSize: "0.9rem" }}>
          <strong>Request:</strong>
        </div>
        <div className="pl-3">
          <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
            method
          </div>
          <div className="mb-2 ps-3" style={{ fontSize: "0.95rem" }}>
            <strong>{rpcObject.method}</strong>
          </div>
          {rpcObject.params !== undefined && (
            <>
              <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
                params
              </div>
              <div className="mb-2 ps-3">
                <div className="p-2 rounded" style={{ backgroundColor: "#333" }}>
                  <JsonTree data={rpcObject.params} />
                </div>
              </div>
            </>
          )}
        </div>
        {rpcObject.options !== undefined && (
          <div className="pl-3" style={{ color: "#aaa", fontSize: "0.85rem" }}>
            {rpcObject.options.timeout && `timeout: ${rpcObject.options.timeout} ms`}
            {rpcObject.options.timeout && rpcObject.options.notification && ", "}
            {rpcObject.options.notification && "notification: true"}
          </div>
        )}
      </div>

      {/* Response */}
      {rpcObject.result !== undefined && (
        <div>
          <div className="mb-2" style={{ color: "#fff", fontSize: "0.9rem" }}>
            <strong>Response:</strong>
          </div>
          <div className="pl-3">
            <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
              result
            </div>
            <div className="pl-3">
              <div className="p-2 rounded" style={{ backgroundColor: "#333", fontSize: "0.95rem" }}>
                <JsonTree data={rpcObject.result} />
              </div>
            </div>
          </div>
        </div>
      )}
      {rpcObject.error !== undefined && (
        <div>
          <div className="mb-2" style={{ color: "#fff", fontSize: "0.9rem" }}>
            <strong>Error:</strong>
          </div>
          <div className="pl-3">
            <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
              error
            </div>
            <div className="pl-3">
              <div
                className="p-2 rounded text-danger"
                style={{ backgroundColor: "#333", fontSize: "0.95rem" }}
              >
                <JsonTree data={rpcObject.error} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Rpc() {
  const rpcObjectsValue = rpcObjects.value;

  return (
    <>
      <RpcForm />
      {rpcObjectsValue.length > 0 && (
        <>
          <div className="py-1 mt-3">
            <h5>RPC Results</h5>
            <div className="mb-2" style={{ color: "#aaa", fontSize: "0.85rem" }}>
              {rpcObjectsValue.length} 件を表示
            </div>
            <ClearButton />
          </div>
          <div>
            {rpcObjectsValue.map((rpcObject, index) => {
              const key = `${rpcObject.timestamp}-${index}`;
              return <RpcObjectItem key={key} rpcObject={rpcObject} />;
            })}
          </div>
        </>
      )}
    </>
  );
}
