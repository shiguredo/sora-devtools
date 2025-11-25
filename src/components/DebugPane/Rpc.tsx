import React, { useEffect, useRef, useState } from 'react'
import { Button, Dropdown, DropdownButton, FormControl, InputGroup } from 'react-bootstrap'

import { setRpcObject } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'
import { RPC_TEMPLATES } from '@/constants'
import type { RpcObject } from '@/types'
import { JSONInputField } from '@/components/DevtoolsPane/JSONInputField.tsx'

import { JsonTree } from './JsonTree.tsx'

const ClearButton = React.memo(() => {
  const onClick = (): void => {
    useSoraDevtoolsStore.getState().clearRpcObjects()
  }
  return (
    <input
      className="btn btn-secondary"
      type="button"
      name="clear"
      defaultValue="clear"
      onClick={onClick}
    />
  )
})

const RpcForm: React.FC = () => {
  const methodRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<HTMLInputElement>(null)
  const [notification, setNotification] = useState(false)
  const [method, setMethod] = useState('')
  const [params, setParams] = useState('')
  const [paramsHasError, setParamsHasError] = useState(false)

  const sora = useSoraDevtoolsStore((state) => state.soraContents.sora)
  const connectionStatus = useSoraDevtoolsStore((state) => state.soraContents.connectionStatus)

  // params の JSON パースエラーをチェック
  useEffect(() => {
    if (params.trim() === '') {
      setParamsHasError(false)
      return
    }
    try {
      JSON.parse(params)
      setParamsHasError(false)
    } catch {
      setParamsHasError(true)
    }
  }, [params])

  const handleCallRpc = async (): Promise<void> => {
    if (!methodRef.current || !timeoutRef.current) {
      return
    }

    const method = methodRef.current.value
    if (!method) {
      return
    }

    let parsedParams: Record<string, unknown> | unknown[] | undefined
    const paramsText = params.trim()
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
    if (notification) {
      options.notification = true
    }

    const timestamp = Date.now()
    const startTime = performance.now()

    if (sora && connectionStatus === 'connected') {
      try {
        const result = await sora.rpc(method, parsedParams, options)
        const endTime = performance.now()
        const duration = endTime - startTime
        setRpcObject({
          timestamp,
          method,
          params: parsedParams,
          options,
          result,
          duration,
        })
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime

        // エラーオブジェクトの構造を解析
        let errorCode = -1
        let errorMessage = 'Unknown error'

        if (error && typeof error === 'object') {
          // JSON-RPC エラーの場合
          if ('code' in error && typeof error.code === 'number') {
            errorCode = error.code
          }
          // エラーメッセージを取得
          if ('message' in error && typeof error.message === 'string') {
            errorMessage = error.message
          } else if (error instanceof Error) {
            errorMessage = error.message
          }
        } else if (typeof error === 'string') {
          errorMessage = error
        }

        setRpcObject({
          timestamp,
          method,
          params: parsedParams,
          options,
          error: {
            code: errorCode,
            message: errorMessage,
          },
          duration,
        })
      }
    }
  }

  return (
    <div className="mt-2">
      <div className="mb-2 d-flex gap-2">
        <div style={{ width: '600px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>method:</strong>
          </div>
          <InputGroup>
            <FormControl
              type="text"
              placeholder="method name"
              ref={methodRef}
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            />
            <DropdownButton variant="outline-secondary" title="" align="end">
              {RPC_TEMPLATES.map((template) => (
                <Dropdown.Item
                  key={template.method}
                  as="button"
                  onClick={() => {
                    setMethod(template.method)
                    if (methodRef.current) {
                      methodRef.current.value = template.method
                    }
                    if (template.params) {
                      setParams(JSON.stringify(template.params, null, 2))
                    }
                  }}
                >
                  {template.method}
                </Dropdown.Item>
              ))}
            </DropdownButton>
          </InputGroup>
        </div>

        <div style={{ width: '150px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>timeout (ms):</strong>
          </div>
          <FormControl type="number" placeholder="5000" defaultValue="5000" ref={timeoutRef} />
        </div>

        <div style={{ width: '200px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>notification:</strong>
          </div>
          <div className="form-check" style={{ paddingTop: '0.5rem' }}>
            <input
              className="form-check-input"
              type="checkbox"
              id="rpcNotificationCheck"
              checked={notification}
              onChange={(e) => setNotification(e.target.checked)}
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
      </div>

      <div className="mb-2">
        <div className="mb-1" style={{ color: '#fff' }}>
          <strong>params:</strong>
        </div>
        <JSONInputField
          controlId="rpcParams"
          placeholder='{"key": "value"} or ["value1", "value2"]'
          value={params}
          setValue={setParams}
          disabled={false}
          rows={6}
          cols={80}
        />
      </div>

      <div className="d-flex justify-content-end mb-2">
        <Button
          variant="secondary"
          onClick={handleCallRpc}
          disabled={connectionStatus !== 'connected' || paramsHasError}
          style={{ fontSize: '1.2rem', padding: '0.75rem 2rem', fontWeight: 'bold' }}
        >
          Call
        </Button>
      </div>
    </div>
  )
}

const RpcObjectItem: React.FC<{ rpcObject: RpcObject }> = ({ rpcObject }) => {
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
      <div className="mb-3 d-flex justify-content-between" style={{ color: '#ccc' }}>
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

export const Rpc: React.FC = () => {
  const rpcObjects = useSoraDevtoolsStore((state) => state.rpcObjects)

  return (
    <>
      <RpcForm />
      {rpcObjects.length > 0 && (
        <>
          <div className="py-1 mt-3">
            <h5>RPC Results</h5>
            <div className="mb-2" style={{ color: '#aaa', fontSize: '0.85rem' }}>
              {rpcObjects.length} 件を表示
            </div>
            <ClearButton />
          </div>
          <div>
            {rpcObjects.map((rpcObject, index) => {
              const key = `${rpcObject.timestamp}-${index}`
              return <RpcObjectItem key={key} rpcObject={rpcObject} />
            })}
          </div>
        </>
      )}
    </>
  )
}
