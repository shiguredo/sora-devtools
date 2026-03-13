import { useSignal } from "@preact/signals";
import type { RefObject } from "preact";
import { useEffect, useRef } from "preact/hooks";

import { clearApiObjects, setApiObject, setDebugApiUrl } from "@/app/actions";
import { apiObjects, channelId, connectionId, debugApiUrl, sessionId } from "@/app/signals";
import { API_TEMPLATES } from "@/constants";
import type { ApiObject } from "@/types";
import { JSONInputField } from "@/components/DevtoolsPane/JSONInputField.tsx";

import { JsonTree } from "./JsonTree.tsx";

// パラメータの JSON をパースし、トップレベルの ID フィールドを置き換える
function parseAndReplaceParams(
  paramsText: string,
  replaceOptions: {
    replaceChannelId: boolean;
    replaceSessionId: boolean;
    replaceConnectionId: boolean;
    channelIdValue: string;
    sessionIdValue: string | null;
    connectionIdValue: string | null;
  },
): Record<string, unknown> | unknown[] | undefined {
  if (!paramsText) {
    return undefined;
  }

  const parsed: Record<string, unknown> | unknown[] = JSON.parse(paramsText);

  if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
    if (replaceOptions.replaceChannelId && "channel_id" in parsed) {
      parsed.channel_id = replaceOptions.channelIdValue;
    }
    if (
      replaceOptions.replaceSessionId &&
      "session_id" in parsed &&
      replaceOptions.sessionIdValue
    ) {
      parsed.session_id = replaceOptions.sessionIdValue;
    }
    if (
      replaceOptions.replaceConnectionId &&
      "connection_id" in parsed &&
      replaceOptions.connectionIdValue
    ) {
      parsed.connection_id = replaceOptions.connectionIdValue;
    }
  }

  return parsed;
}

// Headers オブジェクトから Record に変換する
function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {};
  for (const [key, value] of headers) {
    record[key] = value;
  }
  return record;
}

// エラーからメッセージと種別を判定する
function classifyApiError(
  error: unknown,
  timeout: number,
): { errorMessage: string; errorType: "cors" | "timeout" | "network" | "unknown" } {
  let errorMessage = "Unknown error";
  let errorType: "cors" | "timeout" | "network" | "unknown" = "unknown";

  if (error instanceof Error) {
    errorMessage = error.message;
    if (error.name === "AbortError") {
      errorType = "timeout";
      errorMessage = `Request timeout (${timeout}ms)`;
    }
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  return { errorMessage, errorType };
}

function ClearButton() {
  const onClick = (): void => {
    clearApiObjects();
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-1.5 text-base bg-red-600 text-white border border-red-600 rounded-md hover:bg-red-700"
    >
      Clear All
    </button>
  );
}

interface ApiFormProps {
  url: string;
  setUrl: (url: string) => void;
  selectedMethod: string;
  params: string;
  setParams: (params: string) => void;
  setShowModal: (show: boolean) => void;
  buttonRef: RefObject<HTMLButtonElement>;
}

function ApiForm({
  url,
  setUrl,
  selectedMethod,
  params,
  setParams,
  setShowModal,
  buttonRef,
}: ApiFormProps) {
  const urlRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<HTMLInputElement>(null);
  const paramsHasError = useSignal(false);
  const replaceChannelId = useSignal(true);
  const replaceConnectionId = useSignal(true);
  const replaceSessionId = useSignal(true);

  const channelIdValue = channelId.value;
  const connectionIdValue = connectionId.value;
  const sessionIdValue = sessionId.value;

  // params の JSON パースエラーをチェック
  useEffect(() => {
    if (params.trim() === "") {
      paramsHasError.value = false;
      return;
    }
    try {
      JSON.parse(params);
      paramsHasError.value = false;
    } catch {
      paramsHasError.value = true;
    }
  }, [params, paramsHasError]);

  // 置き換え後のプレビューを生成
  const getReplacedParams = (): string => {
    if (params.trim() === "" || paramsHasError.value) {
      return "";
    }
    try {
      const parsed = JSON.parse(params);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const replaced = { ...parsed };
        if (replaceChannelId.value && "channel_id" in replaced) {
          replaced.channel_id = channelIdValue;
        }
        if (replaceConnectionId.value && "connection_id" in replaced && connectionIdValue) {
          replaced.connection_id = connectionIdValue;
        }
        if (replaceSessionId.value && "session_id" in replaced && sessionIdValue) {
          replaced.session_id = sessionIdValue;
        }
        return JSON.stringify(replaced, null, 2);
      }
      return JSON.stringify(parsed, null, 2);
    } catch {
      return "";
    }
  };

  const handleCallApi = async (): Promise<void> => {
    if (!urlRef.current || !timeoutRef.current) {
      return;
    }

    const urlValue = urlRef.current.value;
    if (!urlValue) {
      return;
    }

    console.log("API Request URL:", urlValue);

    let parsedParams: Record<string, unknown> | unknown[] | undefined;
    const paramsText = params.trim();
    if (paramsText) {
      try {
        parsedParams = parseAndReplaceParams(paramsText, {
          replaceChannelId: replaceChannelId.value,
          replaceSessionId: replaceSessionId.value,
          replaceConnectionId: replaceConnectionId.value,
          channelIdValue,
          sessionIdValue,
          connectionIdValue,
        });
      } catch (error) {
        console.error("Invalid JSON in params:", error);
        return;
      }
    }

    const timeoutValue = Number.parseInt(timeoutRef.current.value, 10);
    const timeout = !Number.isNaN(timeoutValue) && timeoutValue > 0 ? timeoutValue : 5000;

    const timestamp = Date.now();
    const startTime = performance.now();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    const request = new Request(urlValue, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-sora-target": selectedMethod,
      },
      body: JSON.stringify(parsedParams),
      mode: "cors",
      signal: controller.signal,
    });

    const requestHeaders = headersToRecord(request.headers);

    try {
      const response = await fetch(request);
      clearTimeout(timeoutId);
      const duration = performance.now() - startTime;

      const contentType = response.headers.get("content-type");
      const responseBody: unknown = contentType?.includes("application/json")
        ? await response.json()
        : await response.text();

      setApiObject({
        timestamp,
        url: urlValue,
        method: selectedMethod,
        requestHeaders,
        requestBody: parsedParams,
        status: response.status,
        responseHeaders: headersToRecord(response.headers),
        responseBody,
        duration,
      });
    } catch (error) {
      clearTimeout(timeoutId);
      const duration = performance.now() - startTime;
      const { errorMessage, errorType } = classifyApiError(error, timeout);

      setApiObject({
        timestamp,
        url: urlValue,
        method: selectedMethod,
        requestHeaders,
        requestBody: parsedParams,
        error: errorMessage,
        errorType,
        duration,
      });
    }
  };

  return (
    <div className="mt-2">
      <div className="mb-2 flex gap-2">
        <div style={{ width: "600px" }}>
          <div className="mb-1" style={{ color: "#fff" }}>
            <strong>URL:</strong>
          </div>
          <input
            type="text"
            placeholder="http://sora-test.shiguredo.co.jp:3000"
            ref={urlRef}
            value={url}
            onChange={(e) => {
              setUrl((e.target as HTMLInputElement).value);
            }}
            className="block w-full px-3 py-1.5 text-base leading-normal bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
          />
        </div>

        <div style={{ flex: 1 }}>
          <div className="mb-1" style={{ color: "#fff" }}>
            <strong>method:</strong>
          </div>
          <button
            type="button"
            ref={buttonRef}
            onClick={() => {
              setShowModal(true);
            }}
            className="w-full px-3 py-1.5 text-base font-bold bg-gray-600 text-white border border-gray-600 rounded-md hover:bg-gray-700"
          >
            {selectedMethod || "Select method"}
          </button>
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
            className="block w-full px-3 py-1.5 text-base leading-normal bg-gray-800 text-white border border-gray-600 rounded-md focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/25"
          />
        </div>
      </div>

      <div className="mb-2 flex gap-2">
        <div style={{ flex: 1 }}>
          <div className="mb-1" style={{ color: "#fff" }}>
            <strong>params:</strong>
          </div>
          <JSONInputField
            controlId="apiParams"
            placeholder='{"key": "value"} or ["value1", "value2"]'
            value={params}
            setValue={setParams}
            disabled={false}
            rows={12}
            cols={80}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div className="mb-1 flex justify-between items-center">
            <strong style={{ color: "#fff" }}>Preview (after replace):</strong>
            <div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="replaceChannelId"
                  checked={replaceChannelId.value}
                  onChange={(e) => {
                    replaceChannelId.value = (e.target as HTMLInputElement).checked;
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="replaceChannelId"
                  style={{ fontSize: "0.85rem", color: "#fff" }}
                >
                  channel_id
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="replaceSessionId"
                  checked={replaceSessionId.value}
                  onChange={(e) => {
                    replaceSessionId.value = (e.target as HTMLInputElement).checked;
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="replaceSessionId"
                  style={{ fontSize: "0.85rem", color: "#fff" }}
                >
                  session_id
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="replaceConnectionId"
                  checked={replaceConnectionId.value}
                  onChange={(e) => {
                    replaceConnectionId.value = (e.target as HTMLInputElement).checked;
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="replaceConnectionId"
                  style={{ fontSize: "0.85rem", color: "#fff" }}
                >
                  connection_id
                </label>
              </div>
            </div>
          </div>
          <pre
            style={{
              backgroundColor: "#333",
              color: "#fff",
              padding: "0.75rem",
              borderRadius: "0.25rem",
              fontSize: "0.875rem",
              minHeight: "300px",
              maxHeight: "300px",
              overflowY: "auto",
              margin: 0,
            }}
          >
            {getReplacedParams() || "(empty or invalid JSON)"}
          </pre>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={handleCallApi}
          disabled={!selectedMethod || paramsHasError.value}
          className="px-8 py-3 text-xl font-bold bg-gray-600 text-white border border-gray-600 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Call
        </button>
      </div>
    </div>
  );
}

interface ApiObjectItemProps {
  apiObject: ApiObject;
  onReuse: (apiObject: ApiObject) => void;
}

// HTTP ステータスコードに対応する色を返す
function getStatusColor(status?: number): string {
  if (!status) {
    return "#fff";
  }
  if (status >= 200 && status < 300) {
    return "#28a745";
  }
  if (status >= 300 && status < 400) {
    return "#17a2b8";
  }
  if (status >= 400 && status < 500) {
    return "#ffc107";
  }
  if (status >= 500) {
    return "#dc3545";
  }
  return "#fff";
}

function ApiObjectItem({ apiObject, onReuse }: ApiObjectItemProps) {
  const date = new Date(apiObject.timestamp);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");
  const milliseconds = date.getMilliseconds().toString().padStart(3, "0");
  const fullTimeString = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}]`;

  return (
    <div
      className="mb-3 me-2 p-3 border rounded"
      style={{ backgroundColor: "#1a1a1a", color: "#fff" }}
    >
      <div className="mb-3 flex justify-between items-center" style={{ color: "#ccc" }}>
        <small>{fullTimeString}</small>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              onReuse(apiObject);
            }}
            className="px-2 py-1 text-sm bg-gray-600 text-white border border-gray-600 rounded-md hover:bg-gray-700"
          >
            Reuse
          </button>
          {apiObject.duration !== undefined && <small>{apiObject.duration.toFixed(2)} ms</small>}
        </div>
      </div>

      {/* Request */}
      <div className="mb-3">
        <div className="mb-2" style={{ color: "#fff", fontSize: "0.9rem" }}>
          <strong>Request:</strong>
        </div>
        <div className="pl-3">
          <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
            URL
          </div>
          <div className="mb-2 pl-3">
            <div className="p-2 rounded" style={{ backgroundColor: "#333", fontSize: "0.9rem" }}>
              {apiObject.url}
            </div>
          </div>

          {apiObject.requestHeaders && Object.keys(apiObject.requestHeaders).length > 0 && (
            <>
              <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
                headers
              </div>
              <div className="mb-2 pl-3">
                <div
                  className="p-2 rounded"
                  style={{ backgroundColor: "#333", fontSize: "0.85rem" }}
                >
                  {Object.entries(apiObject.requestHeaders).map(([key, value]) => (
                    <div key={key}>
                      <span style={{ color: "#aaa" }}>{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {apiObject.requestBody !== undefined && (
            <>
              <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
                body
              </div>
              <div className="mb-2 pl-3">
                <div className="p-2 rounded" style={{ backgroundColor: "#333" }}>
                  <JsonTree data={apiObject.requestBody} />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Response */}
      {apiObject.status !== undefined && (
        <div>
          <div className="mb-2" style={{ color: "#fff", fontSize: "0.9rem" }}>
            <strong>Response:</strong>
          </div>
          <div className="pl-3">
            <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
              status
            </div>
            <div className="mb-2 pl-3">
              <span
                className="badge"
                style={{
                  backgroundColor: getStatusColor(apiObject.status),
                  fontSize: "0.9rem",
                }}
              >
                {apiObject.status}
              </span>
            </div>

            {apiObject.responseHeaders && Object.keys(apiObject.responseHeaders).length > 0 && (
              <>
                <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
                  headers
                </div>
                <div className="mb-2 pl-3">
                  <div
                    className="p-2 rounded"
                    style={{ backgroundColor: "#333", fontSize: "0.85rem" }}
                  >
                    {Object.entries(apiObject.responseHeaders).map(([key, value]) => (
                      <div key={key}>
                        <span style={{ color: "#aaa" }}>{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {apiObject.responseBody !== undefined && (
              <>
                <div className="mb-1" style={{ color: "#fff", fontSize: "0.85rem" }}>
                  body
                </div>
                <div className="pl-3">
                  <div
                    className="p-2 rounded"
                    style={{ backgroundColor: "#333", fontSize: "0.95rem" }}
                  >
                    <JsonTree data={apiObject.responseBody} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {apiObject.error !== undefined && (
        <div>
          <div className="mb-2" style={{ color: "#fff", fontSize: "0.9rem" }}>
            <strong>Error:</strong>
          </div>
          <div className="pl-3">
            {apiObject.errorType === "timeout" && (
              <div className="mb-2">
                <span className="badge" style={{ backgroundColor: "#ffc107", fontSize: "0.85rem" }}>
                  タイムアウト
                </span>
              </div>
            )}
            <div
              className="p-2 rounded text-danger"
              style={{ backgroundColor: "#333", fontSize: "0.95rem" }}
            >
              {apiObject.error}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function Api() {
  const apiObjectsValue = apiObjects.value;
  const url = debugApiUrl.value;
  const setUrl = (value: string): void => {
    setDebugApiUrl(value);
  };
  const selectedMethod = useSignal("");
  const params = useSignal("");
  const showModal = useSignal(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const modalTop = useSignal(0);
  const modalLeft = useSignal(0);
  const modalWidth = useSignal(0);

  // ボタンの位置が変わったときにモーダルの位置を更新
  useEffect(() => {
    if (showModal.value && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // API タブページの幅を取得するため、親要素を探す
      const container = buttonRef.current.closest('[style*="position: relative"]');
      if (container) {
        const containerRect = container.getBoundingClientRect();
        modalTop.value = rect.bottom + 4;
        modalLeft.value = containerRect.left;
        modalWidth.value = containerRect.width;
      }
    }
  }, [showModal.value, modalTop, modalLeft, modalWidth]);

  const handleReuse = (apiObject: ApiObject): void => {
    setUrl(apiObject.url);
    selectedMethod.value = apiObject.method;
    params.value =
      apiObject.requestBody !== undefined ? JSON.stringify(apiObject.requestBody, null, 2) : "";
    // フォームの位置までスクロール
    globalThis.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleMethodSelect = (
    method: string,
    methodParams?: Record<string, unknown> | unknown[],
  ): void => {
    selectedMethod.value = method;
    params.value = methodParams ? JSON.stringify(methodParams, null, 2) : "";
    showModal.value = false;
  };

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {showModal.value && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 998,
          }}
          onClick={() => {
            showModal.value = false;
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              showModal.value = false;
            }
          }}
        />
      )}
      {showModal.value && (
        <div
          style={{
            position: "fixed",
            top: `${modalTop.value}px`,
            left: `${modalLeft.value}px`,
            width: `${modalWidth.value}px`,
            backgroundColor: "#1a1a1a",
            border: "1px solid #444",
            borderRadius: "8px",
            maxHeight: `calc(100vh - ${modalTop.value}px - 20px)`,
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            padding: "20px",
          }}
        >
          <button
            type="button"
            onClick={() => {
              showModal.value = false;
            }}
            className="absolute top-2.5 right-2.5 z-10 px-2 py-1 text-sm bg-transparent text-white border border-white rounded-md hover:bg-white hover:text-gray-900"
          >
            ×
          </button>
          {(() => {
            type TemplateType = (typeof API_TEMPLATES)[number];
            const groups: Record<string, TemplateType[]> = {};
            for (const template of API_TEMPLATES) {
              const group = template.group ?? "Other";
              if (!groups[group]) {
                groups[group] = [];
              }
              groups[group].push(template);
            }

            return Object.entries(groups).map(([groupName, templates]) => (
              <div key={groupName} className="mb-4">
                <div
                  style={{
                    color: "#fff",
                    fontWeight: "bold",
                    marginBottom: "12px",
                    fontSize: "1.1rem",
                  }}
                >
                  {groupName}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {templates.map((template) => (
                    <button
                      type="button"
                      key={template.method}
                      onClick={() => {
                        handleMethodSelect(template.method, template.params);
                      }}
                      className={`w-full px-3 py-3 text-lg font-bold rounded-md ${
                        selectedMethod.value === template.method
                          ? "bg-blue-600 text-white border border-blue-600 hover:bg-blue-700"
                          : "bg-gray-600 text-white border border-gray-600 hover:bg-gray-700"
                      }`}
                    >
                      {template.method.replace("Sora_", "")}
                    </button>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      )}
      <ApiForm
        url={url}
        setUrl={setUrl}
        selectedMethod={selectedMethod.value}
        params={params.value}
        setParams={(value: string) => {
          params.value = value;
        }}
        setShowModal={(value: boolean) => {
          showModal.value = value;
        }}
        buttonRef={buttonRef}
      />
      {apiObjectsValue.length > 0 && (
        <>
          <div className="py-1">
            <h5>API Results</h5>
            <div className="flex justify-between items-center mb-2">
              <ClearButton />
              <div style={{ color: "#aaa", fontSize: "0.85rem" }}>
                {apiObjectsValue.length} 件を表示
              </div>
            </div>
          </div>
          <div style={{ overflowY: "scroll", flex: 1 }}>
            {apiObjectsValue.map((apiObject, index) => {
              const key = `${apiObject.timestamp}-${index}`;
              return <ApiObjectItem key={key} apiObject={apiObject} onReuse={handleReuse} />;
            })}
          </div>
        </>
      )}
    </div>
  );
}
