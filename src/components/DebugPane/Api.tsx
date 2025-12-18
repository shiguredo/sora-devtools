import { useSignal } from '@preact/signals'
import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'
import { memo } from 'preact/compat'
import { useEffect, useRef } from 'preact/hooks'
import {
  $apiObjects,
  $channelId,
  $connectionId,
  $debugApiUrl,
  $sessionId,
  clearApiObjects,
  setApiObject,
  setDebugApiUrl,
} from '@/app/store'
import { JSONInputField } from '@/components/DevtoolsPane/JSONInputField.tsx'
import { API_TEMPLATES } from '@/constants'
import type { ApiObject } from '@/types'

import { JsonTree } from './JsonTree.tsx'

const ClearButton = memo(() => {
  const onClick = (): void => {
    clearApiObjects()
  }
  return (
    <button
      type="button"
      className="px-3 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
      onClick={onClick}
    >
      Clear All
    </button>
  )
})

type ApiFormProps = {
  url: string
  setUrl: (url: string) => void
  selectedMethod: string
  params: string
  setParams: (params: string) => void
  setShowModal: (show: boolean) => void
  buttonRef: { current: HTMLButtonElement | null }
}

const ApiForm: FunctionComponent<ApiFormProps> = ({
  url,
  setUrl,
  selectedMethod,
  params,
  setParams,
  setShowModal,
  buttonRef,
}) => {
  const urlRef = useRef<HTMLInputElement>(null)
  const timeoutRef = useRef<HTMLInputElement>(null)
  const paramsHasError = useSignal(false)
  const replaceChannelId = useSignal(true)
  const replaceConnectionId = useSignal(true)
  const replaceSessionId = useSignal(true)

  // params の JSON パースエラーをチェック
  useEffect(() => {
    if (params.trim() === '') {
      paramsHasError.value = false
      return
    }
    try {
      JSON.parse(params)
      paramsHasError.value = false
    } catch {
      paramsHasError.value = true
    }
  }, [params, paramsHasError])

  // 置き換え後のプレビューを生成
  const getReplacedParams = (): string => {
    if (params.trim() === '' || paramsHasError.value) {
      return ''
    }
    try {
      const parsed = JSON.parse(params)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const replaced = { ...parsed }
        if (replaceChannelId.value && 'channel_id' in replaced) {
          replaced.channel_id = $channelId.value
        }
        if (replaceConnectionId.value && 'connection_id' in replaced && $connectionId.value) {
          replaced.connection_id = $connectionId.value
        }
        if (replaceSessionId.value && 'session_id' in replaced && $sessionId.value) {
          replaced.session_id = $sessionId.value
        }
        return JSON.stringify(replaced, null, 2)
      }
      return JSON.stringify(parsed, null, 2)
    } catch {
      return ''
    }
  }

  const handleCallApi = async (): Promise<void> => {
    if (!urlRef.current || !timeoutRef.current) {
      return
    }

    const urlValue = urlRef.current.value
    if (!urlValue) {
      return
    }

    console.log('API Request URL:', urlValue)

    let parsedParams: Record<string, unknown> | unknown[] | undefined
    const paramsText = params.trim()
    if (paramsText) {
      try {
        parsedParams = JSON.parse(paramsText)
        // トップレベルの channel_id, session_id, connection_id を置き換える
        if (parsedParams && typeof parsedParams === 'object' && !Array.isArray(parsedParams)) {
          if (replaceChannelId.value && 'channel_id' in parsedParams) {
            parsedParams.channel_id = $channelId.value
          }
          if (replaceSessionId.value && 'session_id' in parsedParams && $sessionId.value) {
            parsedParams.session_id = $sessionId.value
          }
          if (replaceConnectionId.value && 'connection_id' in parsedParams && $connectionId.value) {
            parsedParams.connection_id = $connectionId.value
          }
        }
      } catch (error) {
        console.error('Invalid JSON in params:', error)
        return
      }
    }

    const timeoutValue = Number.parseInt(timeoutRef.current.value, 10)
    const timeout = !Number.isNaN(timeoutValue) && timeoutValue > 0 ? timeoutValue : 5000

    const timestamp = Date.now()
    const startTime = performance.now()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-sora-target': selectedMethod,
      },
      body: JSON.stringify(parsedParams),
      mode: 'cors',
      signal: controller.signal,
    }

    const request = new Request(urlValue, fetchOptions)

    // Request headers を取得
    const requestHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => {
      requestHeaders[key] = value
    })

    try {
      const response = await fetch(request)
      clearTimeout(timeoutId)
      const endTime = performance.now()
      const duration = endTime - startTime

      // Response headers を取得
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })

      let responseBody: unknown
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        responseBody = await response.json()
      } else {
        responseBody = await response.text()
      }

      setApiObject({
        timestamp,
        url: urlValue,
        method: selectedMethod,
        requestHeaders,
        requestBody: parsedParams,
        status: response.status,
        responseHeaders,
        responseBody,
        duration,
      })
    } catch (error) {
      clearTimeout(timeoutId)
      const endTime = performance.now()
      const duration = endTime - startTime

      let errorMessage = 'Unknown error'
      let errorType: 'cors' | 'timeout' | 'network' | 'unknown' = 'unknown'

      if (error instanceof Error) {
        errorMessage = error.message

        // エラー種別を判定
        if (error.name === 'AbortError') {
          errorType = 'timeout'
          errorMessage = `Request timeout (${timeout}ms)`
        } else {
          errorType = 'unknown'
        }
      } else if (typeof error === 'string') {
        errorMessage = error
      }

      setApiObject({
        timestamp,
        url: urlValue,
        method: selectedMethod,
        requestHeaders,
        requestBody: parsedParams,
        error: errorMessage,
        errorType,
        duration,
      })
    }
  }

  return (
    <div className="mt-2">
      <div className="mb-2 flex gap-2">
        <div style={{ width: '600px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>URL:</strong>
          </div>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="http://sora-test.shiguredo.co.jp:3000"
            ref={urlRef}
            value={url}
            onChange={(e: TargetedEvent<HTMLInputElement>) => setUrl(e.currentTarget.value)}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>method:</strong>
          </div>
          <button
            type="button"
            ref={buttonRef}
            className="px-3 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded"
            onClick={() => setShowModal(true)}
            style={{ width: '100%', fontSize: '1rem', fontWeight: 'bold' }}
          >
            {selectedMethod || 'Select method'}
          </button>
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

      <div className="mb-2 flex gap-2">
        <div style={{ flex: 1 }}>
          <div className="mb-1" style={{ color: '#fff' }}>
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
            <strong style={{ color: '#fff' }}>Preview (after replace):</strong>
            <div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="replaceChannelId"
                  checked={replaceChannelId.value}
                  onChange={(e: TargetedEvent<HTMLInputElement>) => {
                    replaceChannelId.value = e.currentTarget.checked
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="replaceChannelId"
                  style={{ fontSize: '0.85rem', color: '#fff' }}
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
                  onChange={(e: TargetedEvent<HTMLInputElement>) => {
                    replaceSessionId.value = e.currentTarget.checked
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="replaceSessionId"
                  style={{ fontSize: '0.85rem', color: '#fff' }}
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
                  onChange={(e: TargetedEvent<HTMLInputElement>) => {
                    replaceConnectionId.value = e.currentTarget.checked
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor="replaceConnectionId"
                  style={{ fontSize: '0.85rem', color: '#fff' }}
                >
                  connection_id
                </label>
              </div>
            </div>
          </div>
          <pre
            style={{
              backgroundColor: '#333',
              color: '#fff',
              padding: '0.75rem',
              borderRadius: '0.25rem',
              fontSize: '0.875rem',
              minHeight: '300px',
              maxHeight: '300px',
              overflowY: 'auto',
              margin: 0,
            }}
          >
            {getReplacedParams() || '(empty or invalid JSON)'}
          </pre>
        </div>
      </div>

      <div className="flex justify-end mb-2">
        <button
          type="button"
          className="px-3 py-2 bg-gray-500 text-white hover:bg-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleCallApi}
          disabled={!selectedMethod || paramsHasError.value}
          style={{ fontSize: '1.2rem', padding: '0.75rem 2rem', fontWeight: 'bold' }}
        >
          Call
        </button>
      </div>
    </div>
  )
}

type ApiObjectItemProps = {
  apiObject: ApiObject
  onReuse: (apiObject: ApiObject) => void
}

const ApiObjectItem: FunctionComponent<ApiObjectItemProps> = ({ apiObject, onReuse }) => {
  const date = new Date(apiObject.timestamp)
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')
  const milliseconds = date.getMilliseconds().toString().padStart(3, '0')
  const fullTimeString = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}]`

  const getStatusColor = (status?: number): string => {
    if (!status) return '#fff'
    if (status >= 200 && status < 300) return '#28a745' // green
    if (status >= 300 && status < 400) return '#17a2b8' // blue
    if (status >= 400 && status < 500) return '#ffc107' // yellow
    if (status >= 500) return '#dc3545' // red
    return '#fff'
  }

  return (
    <div
      className="mb-3 mr-2 p-3 border rounded"
      style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
    >
      <div className="mb-3 flex justify-between items-center" style={{ color: '#ccc' }}>
        <small>{fullTimeString}</small>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="px-2 py-1 text-sm bg-gray-500 text-white hover:bg-gray-600 rounded"
            onClick={() => onReuse(apiObject)}
          >
            Reuse
          </button>
          {apiObject.duration !== undefined && <small>{apiObject.duration.toFixed(2)} ms</small>}
        </div>
      </div>

      {/* Request */}
      <div className="mb-3">
        <div className="mb-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
          <strong>Request:</strong>
        </div>
        <div className="ps-3">
          <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
            URL
          </div>
          <div className="mb-2 ps-3">
            <div className="p-2 rounded" style={{ backgroundColor: '#333', fontSize: '0.9rem' }}>
              {apiObject.url}
            </div>
          </div>

          {apiObject.requestHeaders && Object.keys(apiObject.requestHeaders).length > 0 && (
            <>
              <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
                headers
              </div>
              <div className="mb-2 ps-3">
                <div
                  className="p-2 rounded"
                  style={{ backgroundColor: '#333', fontSize: '0.85rem' }}
                >
                  {Object.entries(apiObject.requestHeaders).map(([key, value]) => (
                    <div key={key}>
                      <span style={{ color: '#aaa' }}>{key}:</span> {value}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {apiObject.requestBody !== undefined && (
            <>
              <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
                body
              </div>
              <div className="mb-2 ps-3">
                <div className="p-2 rounded" style={{ backgroundColor: '#333' }}>
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
          <div className="mb-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
            <strong>Response:</strong>
          </div>
          <div className="ps-3">
            <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
              status
            </div>
            <div className="mb-2 ps-3">
              <span
                className="badge"
                style={{ backgroundColor: getStatusColor(apiObject.status), fontSize: '0.9rem' }}
              >
                {apiObject.status}
              </span>
            </div>

            {apiObject.responseHeaders && Object.keys(apiObject.responseHeaders).length > 0 && (
              <>
                <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
                  headers
                </div>
                <div className="mb-2 ps-3">
                  <div
                    className="p-2 rounded"
                    style={{ backgroundColor: '#333', fontSize: '0.85rem' }}
                  >
                    {Object.entries(apiObject.responseHeaders).map(([key, value]) => (
                      <div key={key}>
                        <span style={{ color: '#aaa' }}>{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {apiObject.responseBody !== undefined && (
              <>
                <div className="mb-1" style={{ color: '#fff', fontSize: '0.85rem' }}>
                  body
                </div>
                <div className="ps-3">
                  <div
                    className="p-2 rounded"
                    style={{ backgroundColor: '#333', fontSize: '0.95rem' }}
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
          <div className="mb-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
            <strong>Error:</strong>
          </div>
          <div className="ps-3">
            {apiObject.errorType === 'timeout' && (
              <div className="mb-2">
                <span className="badge" style={{ backgroundColor: '#ffc107', fontSize: '0.85rem' }}>
                  タイムアウト
                </span>
              </div>
            )}
            <div
              className="p-2 rounded text-danger"
              style={{ backgroundColor: '#333', fontSize: '0.95rem' }}
            >
              {apiObject.error}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export const Api: FunctionComponent = () => {
  const setUrl = (value: string): void => {
    setDebugApiUrl(value)
  }
  const selectedMethod = useSignal('')
  const params = useSignal('')
  const showModal = useSignal(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const modalTop = useSignal(0)
  const modalLeft = useSignal(0)
  const modalWidth = useSignal(0)

  // ボタンの位置が変わったときにモーダルの位置を更新
  useEffect(() => {
    if (showModal.value && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // API タブページの幅を取得するため、親要素を探す
      const container = buttonRef.current.closest('[style*="position: relative"]')
      if (container) {
        const containerRect = container.getBoundingClientRect()
        modalTop.value = rect.bottom + 4
        modalLeft.value = containerRect.left
        modalWidth.value = containerRect.width
      }
    }
  }, [showModal.value, modalTop, modalLeft, modalWidth])

  const handleReuse = (apiObject: ApiObject): void => {
    setUrl(apiObject.url)
    selectedMethod.value = apiObject.method
    if (apiObject.requestBody !== undefined) {
      params.value = JSON.stringify(apiObject.requestBody, null, 2)
    } else {
      params.value = ''
    }
    // フォームの位置までスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMethodSelect = (
    method: string,
    methodParams?: Record<string, unknown> | unknown[],
  ): void => {
    selectedMethod.value = method
    if (methodParams) {
      params.value = JSON.stringify(methodParams, null, 2)
    } else {
      params.value = ''
    }
    showModal.value = false
  }

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showModal.value && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 998,
          }}
          onClick={() => {
            showModal.value = false
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              showModal.value = false
            }
          }}
        />
      )}
      {showModal.value && (
        <div
          style={{
            position: 'fixed',
            top: `${modalTop.value}px`,
            left: `${modalLeft.value}px`,
            width: `${modalWidth.value}px`,
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '8px',
            maxHeight: `calc(100vh - ${modalTop.value}px - 20px)`,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            padding: '20px',
          }}
        >
          <button
            type="button"
            className="px-2 py-1 text-sm border border-gray-300 text-gray-300 hover:bg-gray-300 hover:text-gray-900 rounded"
            onClick={() => {
              showModal.value = false
            }}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1,
            }}
          >
            ×
          </button>
          {(() => {
            type TemplateType = (typeof API_TEMPLATES)[number]
            const groups = API_TEMPLATES.reduce((acc: Record<string, TemplateType[]>, template) => {
              const group = template.group || 'Other'
              if (!acc[group]) acc[group] = []
              acc[group].push(template)
              return acc
            }, {})

            return Object.entries(groups).map(([groupName, templates]) => (
              <div key={groupName} className="mb-4">
                <div
                  style={{
                    color: '#fff',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    fontSize: '1.1rem',
                  }}
                >
                  {groupName}
                </div>
                <div className="row">
                  {templates.map((template) => (
                    <div key={template.method} className="col-6 mb-2">
                      <button
                        type="button"
                        className={`px-2 py-1 text-sm ${selectedMethod.value === template.method ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-500 hover:bg-gray-600'} text-white rounded`}
                        style={{
                          width: '100%',
                          fontSize: '1.1rem',
                          padding: '12px',
                          fontWeight: 'bold',
                        }}
                        onClick={() => handleMethodSelect(template.method, template.params)}
                      >
                        {template.method.replace('Sora_', '')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          })()}
        </div>
      )}
      <ApiForm
        url={$debugApiUrl.value}
        setUrl={setUrl}
        selectedMethod={selectedMethod.value}
        params={params.value}
        setParams={(v) => {
          params.value = v
        }}
        setShowModal={(v) => {
          showModal.value = v
        }}
        buttonRef={buttonRef}
      />
      {$apiObjects.value.length > 0 && (
        <>
          <div className="py-1">
            <h5>API Results</h5>
            <div className="flex justify-between items-center mb-2">
              <ClearButton />
              <div style={{ color: '#aaa', fontSize: '0.85rem' }}>
                {$apiObjects.value.length} 件を表示
              </div>
            </div>
          </div>
          <div style={{ overflowY: 'scroll', flex: 1 }}>
            {$apiObjects.value.map((apiObject, index) => {
              const key = `${apiObject.timestamp}-${index}`
              return <ApiObjectItem key={key} apiObject={apiObject} onReuse={handleReuse} />
            })}
          </div>
        </>
      )}
    </div>
  )
}
