import { useSignal } from "@preact/signals";
import { useEffect, useRef } from "preact/hooks";

import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  InputGroup,
} from "@/components/ui";

import { clearRpcObjects, setRPCErrorAlertMessage } from "@/app/actions";
import { connectionStatus, rpcObjects, sora } from "@/app/signals";
import { RPC_TEMPLATES } from "@/constants";
import { rpc } from "@/rpc";
import type { RpcObject } from "@/types";
import { JSONInputField } from "@/components/DevtoolsPane/JSONInputField.tsx";
import { getErrorMessage } from "@/utils";

import styles from "./Rpc.module.css";

import { JsonTree } from "./JsonTree.tsx";

function ClearButton() {
  const onClick = (): void => {
    clearRpcObjects();
  };
  return (
    <Button variant="secondary" onClick={onClick}>
      clear
    </Button>
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
  // conn は signal 由来で null を取りうるため | null を追加する
  const rpcMethods: string[] =
    (conn as unknown as { rpcMethods?: string[] } | null)?.rpcMethods ?? [];

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
        // RPC params は任意の key-value を持つオブジェクトのため Record<string, unknown> に縮約する
        parsedParams = JSON.parse(paramsText) as Record<string, unknown>;
      } catch (error) {
        setRPCErrorAlertMessage(`invalid JSON in params: ${getErrorMessage(error)}`);
        return;
      }
    }

    const options: { timeout?: number; notification?: boolean } = {};
    const timeoutValue = Math.trunc(Number(timeoutRef.current.value));
    if (!Number.isNaN(timeoutValue) && timeoutValue > 0) {
      options.timeout = timeoutValue;
    }
    if (notification.value) {
      options.notification = true;
    }

    await rpc(conn, methodValue, parsedParams, options);
  };

  return (
    <div className={styles.form}>
      <div className={styles.formRow}>
        <div className={styles.methodColumn}>
          <div className={styles.fieldLabel}>
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
              className={styles.input}
            />
            <Dropdown>
              <DropdownToggle variant="outline-secondary" />
              {/* メニューの高さは DropdownMenu 側の max-height に従う */}
              <DropdownMenu>
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
                      className={isAvailable ? styles.templateAvailable : ""}
                    >
                      {template.method}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>
          </InputGroup>
        </div>

        <div className={styles.notificationColumn}>
          <div className={styles.fieldLabel}>
            <strong>notification:</strong>
          </div>
          <div className={styles.notificationBody}>
            <input
              type="checkbox"
              id="rpcNotificationCheck"
              checked={notification.value}
              onChange={(e) => {
                notification.value = (e.target as HTMLInputElement).checked;
              }}
            />
            <label htmlFor="rpcNotificationCheck" className={styles.checkLabel}>
              送信のみ (レスポンス不要)
            </label>
          </div>
        </div>

        <div className={styles.timeoutColumn}>
          <div className={styles.fieldLabel}>
            <strong>timeout (ms):</strong>
          </div>
          <input
            type="number"
            placeholder="5000"
            defaultValue="5000"
            ref={timeoutRef}
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.paramsField}>
        <div className={styles.fieldLabel}>
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

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleCallRpc}
          disabled={connectionStatusValue !== "connected" || paramsHasError.value}
          className={styles.callButton}
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
    <div className={styles.item}>
      <div className={styles.itemHeader}>
        <small>{fullTimeString}</small>
        {rpcObject.duration !== undefined && <small>{rpcObject.duration.toFixed(2)} ms</small>}
      </div>

      {/* リクエスト */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <strong>Request:</strong>
        </div>
        <div className={styles.indent}>
          <div className={`${styles.fieldLabel} ${styles.fieldLabelSmall}`}>method</div>
          <div className={`${styles.value} ${styles.valueCompact}`}>
            <strong>{rpcObject.method}</strong>
          </div>
          {rpcObject.params !== undefined && (
            <>
              <div className={`${styles.fieldLabel} ${styles.fieldLabelSmall}`}>params</div>
              <div className={styles.value}>
                <div className={styles.valueBox}>
                  <JsonTree data={rpcObject.params} />
                </div>
              </div>
            </>
          )}
        </div>
        {rpcObject.options !== undefined && (
          <div className={`${styles.indent} ${styles.optionsNote}`}>
            {rpcObject.options.timeout && `timeout: ${rpcObject.options.timeout} ms`}
            {rpcObject.options.timeout && rpcObject.options.notification && ", "}
            {rpcObject.options.notification && "notification: true"}
          </div>
        )}
      </div>

      {/* レスポンス */}
      {rpcObject.result !== undefined && (
        <div>
          <div className={styles.sectionTitle}>
            <strong>Response:</strong>
          </div>
          <div className={styles.indent}>
            <div className={`${styles.fieldLabel} ${styles.fieldLabelSmall}`}>result</div>
            <div className={styles.indent}>
              <div className={`${styles.valueBox} ${styles.valueBoxCompact}`}>
                <JsonTree data={rpcObject.result} />
              </div>
            </div>
          </div>
        </div>
      )}
      {rpcObject.error !== undefined && (
        <div>
          <div className={styles.sectionTitle}>
            <strong>Error:</strong>
          </div>
          <div className={styles.indent}>
            <div className={`${styles.fieldLabel} ${styles.fieldLabelSmall}`}>error</div>
            <div className={styles.indent}>
              <div className={`${styles.valueBox} ${styles.valueBoxCompact} text-danger`}>
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
          <div className={styles.resultsHeader}>
            <h5>RPC Results</h5>
            <div className={styles.resultsCount}>{rpcObjectsValue.length} 件を表示</div>
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
