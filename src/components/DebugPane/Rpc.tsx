import { useSignal } from '@preact/signals'
import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'
import { memo } from 'preact/compat'
import { useEffect, useRef } from 'preact/hooks'
import { $connectionStatus, $rpcObjects, $sora, clearRpcObjects } from '@/app/store'
import { JSONInputField } from '@/components/DevtoolsPane/JSONInputField.tsx'
import { RPC_TEMPLATES } from '@/constants'
import { rpc } from '@/rpc'
import type { RpcObject } from '@/types'

import { JsonTree } from './JsonTree.tsx'

const ClearButton = memo(() => {
  const onClick = (): void => {
    clearRpcObjects()
  }
  return (
    <input
      className="px-3 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded"
      type="button"
      name="clear"
      defaultValue="clear"
      onClick={onClick}
    />
  )
})

const RpcForm: FunctionComponent = () => {
  const methodRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<HTMLInputElement>(null)
  const notification = useSignal(false)
  const method = useSignal('')
  const params = useSignal('')
  const paramsHasError = useSignal(false)
  const dropdownOpen = useSignal(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // rpcMethods は sora-js-sdk 2025.2.0 以降で利用可能
  const rpcMethods: string[] =
    ($sora.value as unknown as { rpcMethods?: string[] })?.rpcMethods ?? []

  // params の JSON パースエラーをチェック
  useEffect(() => {
    if (params.value.trim() === '') {
      paramsHasError.value = false
      return
    }
    try {
      JSON.parse(params.value)
      paramsHasError.value = false
    } catch {
      paramsHasError.value = true
    }
  }, [params.value, paramsHasError])

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        dropdownOpen.value = false
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleCallRpc = async (): Promise<void> => {
    if (
      !methodRef.current ||
      !timeoutRef.current ||
      !$sora.value ||
      $connectionStatus.value !== 'connected'
    ) {
      return
    }

    const method = methodRef.current.value
    if (!method) {
      return
    }

    let parsedParams: Record<string, unknown> | undefined
    const paramsText = params.value.trim()
    if (paramsText) {
      try {
        parsedParams = JSON.parse(paramsText)
      } catch (error) {
        console.error('Invalid JSON in params:', error)
        return
      }
    }

    const options: { timeout?: number; notification?: boolean } = {}
    const timeoutValue = Number.parseInt(timeoutRef.current.value, 10)
    if (!Number.isNaN(timeoutValue) && timeoutValue > 0) {
      options.timeout = timeoutValue
    }
    if (notification.value) {
      options.notification = true
    }

    await rpc($sora.value, method, parsedParams, options)
  }

  return (
    <div className="mt-2">
      <div className="mb-2 flex gap-2">
        <div style={{ width: '600px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>method:</strong>
          </div>
          <div className="flex" ref={containerRef}>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="method name"
              ref={methodRef}
              value={method.value}
              onChange={(e: TargetedEvent<HTMLInputElement>) => {
                method.value = e.currentTarget.value
              }}
            />
            <button
              type="button"
              className="px-3 py-2 border border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white rounded"
              onClick={() => {
                dropdownOpen.value = !dropdownOpen.value
              }}
              aria-expanded={dropdownOpen.value}
            />
            {dropdownOpen.value && (
              <ul
                className="dropdown-menu dropdown-menu-end show"
                style={{ position: 'absolute', right: 0 }}
              >
                {RPC_TEMPLATES.map((template) => {
                  const isAvailable = rpcMethods.includes(template.method)
                  return (
                    <li key={template.method}>
                      <button
                        type="button"
                        className="dropdown-item"
                        onClick={() => {
                          method.value = template.method
                          if (methodRef.current) {
                            methodRef.current.value = template.method
                          }
                          if (template.params) {
                            params.value = JSON.stringify(template.params, null, 2)
                          }
                          dropdownOpen.value = false
                        }}
                        style={isAvailable ? { color: '#0071bc', fontWeight: 'bold' } : undefined}
                      >
                        {template.method}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        <div style={{ width: '250px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>notification:</strong>
          </div>
          <div className="form-check" style={{ paddingTop: '0.5rem' }}>
            <input
              className="form-check-input"
              type="checkbox"
              id="rpcNotificationCheck"
              checked={notification.value}
              onChange={(e: TargetedEvent<HTMLInputElement>) => {
                notification.value = e.currentTarget.checked
              }}
            />
            <label
              className="form-check-label"
              htmlFor="rpcNotificationCheck"
              style={{ color: '#fff' }}
            >
              送信のみ (レスポンス不要)
            </label>
          </div>
        </div>

        <div style={{ width: '150px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>timeout (ms):</strong>
          </div>
          <input
            type="number"
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="5000"
            defaultValue="5000"
            ref={timeoutRef}
          />
        </div>
      </div>

      <div className="mb-2">
        <div className="mb-1" style={{ color: '#fff' }}>
          <strong>params:</strong>
        </div>
        <JSONInputField
          controlId="rpcParams"
          placeholder='{"key": "value"} or ["value1", "value2"]'
          value={params.value}
          setValue={(v) => {
            params.value = v
          }}
          disabled={false}
          rows={6}
          cols={80}
        />
      </div>

      <div className="flex justify-end mb-2">
        <button
          type="button"
          className="px-3 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCallRpc}
          disabled={$connectionStatus.value !== 'connected' || paramsHasError.value}
          style={{ fontSize: '1.2rem', padding: '0.75rem 2rem', fontWeight: 'bold' }}
        >
          Call
        </button>
      </div>
    </div>
  )
}

const RpcObjectItem: FunctionComponent<{ rpcObject: RpcObject }> = ({ rpcObject }) => {
  const date = new Date(rpcObject.timestamp)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')
  const fullTimeString = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}]`

  return (
    <div className="mb-3 p-3 border rounded" style={{ backgroundColor: '#1a1a1a', color: '#fff' }}>
      <div className="mb-3 flex justify-between" style={{ color: '#ccc' }}>
        <small>{fullTimeString}</small>
        {rpcObject.duration !== undefined && <small>{rpcObject.duration.toFixed(2)} ms</small>}
      </div>

      {/* Request */}
      <div className="mb-3">
        <div className="mb-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
          <strong>Request:</strong>
        </div>
        <div className="ps-3">
          <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
            method
          </div>
          <div className="mb-2 ps-3" style={{ fontSize: '0.95rem' }}>
            <strong>{rpcObject.method}</strong>
          </div>
          {rpcObject.params !== undefined && (
            <>
              <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
                params
              </div>
              <div className="mb-2 ps-3">
                <div className="p-2 rounded" style={{ backgroundColor: '#333' }}>
                  <JsonTree data={rpcObject.params} />
                </div>
              </div>
            </>
          )}
        </div>
        {rpcObject.options !== undefined && (
          <div className="ps-3" style={{ color: '#aaa', fontSize: '0.85rem' }}>
            {rpcObject.options.timeout && `timeout: ${rpcObject.options.timeout} ms`}
            {rpcObject.options.timeout && rpcObject.options.notification && ', '}
            {rpcObject.options.notification && 'notification: true'}
          </div>
        )}
      </div>

      {/* Response */}
      {rpcObject.result !== undefined && (
        <div>
          <div className="mb-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
            <strong>Response:</strong>
          </div>
          <div className="ps-3">
            <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
              result
            </div>
            <div className="ps-3">
              <div className="p-2 rounded" style={{ backgroundColor: '#333', fontSize: '0.95rem' }}>
                <JsonTree data={rpcObject.result} />
              </div>
            </div>
          </div>
        </div>
      )}
      {rpcObject.error !== undefined && (
        <div>
          <div className="mb-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
            <strong>Error:</strong>
          </div>
          <div className="ps-3">
            <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
              error
            </div>
            <div className="ps-3">
              <div
                className="p-2 rounded text-danger"
                style={{ backgroundColor: '#333', fontSize: '0.95rem' }}
              >
                <JsonTree data={rpcObject.error} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const Rpc: FunctionComponent = () => {
  return (
    <>
      <RpcForm />
      {$rpcObjects.value.length > 0 && (
        <>
          <div className="py-1 mt-3">
            <h5>RPC Results</h5>
            <div className="mb-2" style={{ color: '#aaa', fontSize: '0.85rem' }}>
              {$rpcObjects.value.length} 件を表示
            </div>
            <ClearButton />
          </div>
          <div>
            {$rpcObjects.value.map((rpcObject, index) => {
              const key = `${rpcObject.timestamp}-${index}`
              return <RpcObjectItem key={key} rpcObject={rpcObject} />
            })}
          </div>
        </>
      )}
    </>
  )
}
