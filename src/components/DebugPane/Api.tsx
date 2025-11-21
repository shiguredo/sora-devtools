import React, { useEffect, useRef, useState } from 'react'
import { Button, Col, FormControl, Row } from 'react-bootstrap'

import { useSoraDevtoolsStore } from '@/app/store'
import { API_TEMPLATES } from '@/constants'
import type { ApiObject } from '@/types'
import { JSONInputField } from '@/components/DevtoolsPane/JSONInputField.tsx'

import { JsonTree } from './JsonTree.tsx'

const ClearButton = React.memo(() => {
  const onClick = (): void => {
    useSoraDevtoolsStore.getState().clearApiObjects()
  }
  return (
    <Button variant="danger" onClick={onClick}>
      Clear All
    </Button>
  )
})

type ApiFormProps = {
  url: string
  setUrl: (url: string) => void
  selectedMethod: string
  params: string
  setParams: (params: string) => void
  setShowModal: (show: boolean) => void
  buttonRef: React.RefObject<HTMLButtonElement | null>
}

const ApiForm: React.FC<ApiFormProps> = ({
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
  const [paramsHasError, setParamsHasError] = useState(false)
  const [replaceChannelId, setReplaceChannelId] = useState(true)
  const [replaceConnectionId, setReplaceConnectionId] = useState(true)
  const [replaceSessionId, setReplaceSessionId] = useState(true)

  const channelId = useSoraDevtoolsStore((state) => state.channelId)
  const connectionId = useSoraDevtoolsStore((state) => state.soraContents.connectionId)
  const sessionId = useSoraDevtoolsStore((state) => state.soraContents.sessionId)

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

  // 置き換え後のプレビューを生成
  const getReplacedParams = (): string => {
    if (params.trim() === '' || paramsHasError) {
      return ''
    }
    try {
      const parsed = JSON.parse(params)
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const replaced = { ...parsed }
        if (replaceChannelId && 'channel_id' in replaced) {
          replaced.channel_id = channelId
        }
        if (replaceConnectionId && 'connection_id' in replaced && connectionId) {
          replaced.connection_id = connectionId
        }
        if (replaceSessionId && 'session_id' in replaced && sessionId) {
          replaced.session_id = sessionId
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
          if (replaceChannelId && 'channel_id' in parsedParams) {
            parsedParams.channel_id = channelId
          }
          if (replaceSessionId && 'session_id' in parsedParams && sessionId) {
            parsedParams.session_id = sessionId
          }
          if (replaceConnectionId && 'connection_id' in parsedParams && connectionId) {
            parsedParams.connection_id = connectionId
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

      useSoraDevtoolsStore.getState().setApiObject({
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

      useSoraDevtoolsStore.getState().setApiObject({
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
      <div className="mb-2 d-flex gap-2">
        <div style={{ width: '400px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>URL:</strong>
          </div>
          <FormControl
            type="text"
            placeholder="http://sora-test.shiguredo.co.jp:3000"
            ref={urlRef}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ backgroundColor: '#333', color: '#fff' }}
          />
        </div>

        <div style={{ flex: 1 }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>method:</strong>
          </div>
          <Button
            ref={buttonRef}
            variant="secondary"
            onClick={() => setShowModal(true)}
            style={{ width: '100%', fontSize: '1rem', fontWeight: 'bold' }}
          >
            {selectedMethod || 'Select method'}
          </Button>
        </div>

        <div style={{ width: '150px' }}>
          <div className="mb-1" style={{ color: '#fff' }}>
            <strong>timeout (ms):</strong>
          </div>
          <FormControl
            type="number"
            placeholder="5000"
            defaultValue="5000"
            ref={timeoutRef}
            style={{ backgroundColor: '#333', color: '#fff' }}
          />
        </div>
      </div>

      <div className="mb-2 d-flex gap-2">
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
          <div className="mb-1 d-flex justify-content-between align-items-center">
            <strong style={{ color: '#fff' }}>Preview (after replace):</strong>
            <div>
              <div className="form-check form-check-inline">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="replaceChannelId"
                  checked={replaceChannelId}
                  onChange={(e) => setReplaceChannelId(e.target.checked)}
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
                  checked={replaceSessionId}
                  onChange={(e) => setReplaceSessionId(e.target.checked)}
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
                  checked={replaceConnectionId}
                  onChange={(e) => setReplaceConnectionId(e.target.checked)}
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

      <div className="d-flex justify-content-end mb-2">
        <Button
          variant="secondary"
          onClick={handleCallApi}
          disabled={!selectedMethod || paramsHasError}
          style={{ fontSize: '1.2rem', padding: '0.75rem 2rem', fontWeight: 'bold' }}
        >
          Call
        </Button>
      </div>
    </div>
  )
}

type ApiObjectItemProps = {
  apiObject: ApiObject
  onReuse: (apiObject: ApiObject) => void
}

const ApiObjectItem: React.FC<ApiObjectItemProps> = ({ apiObject, onReuse }) => {
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
      className="mb-3 me-2 p-3 border rounded"
      style={{ backgroundColor: '#1a1a1a', color: '#fff' }}
    >
      <div
        className="mb-3 d-flex justify-content-between align-items-center"
        style={{ color: '#ccc' }}
      >
        <small>{fullTimeString}</small>
        <div className="d-flex align-items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onReuse(apiObject)}>
            Reuse
          </Button>
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

export const Api: React.FC = () => {
  const apiObjects = useSoraDevtoolsStore((state) => state.apiObjects)
  const url = useSoraDevtoolsStore((state) => state.debugApiUrl)
  const setUrl = (value: string): void => {
    useSoraDevtoolsStore.getState().setDebugApiUrl(value)
  }
  const [selectedMethod, setSelectedMethod] = useState('')
  const [params, setParams] = useState('')
  const [showModal, setShowModal] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [modalTop, setModalTop] = useState(0)
  const [modalLeft, setModalLeft] = useState(0)
  const [modalWidth, setModalWidth] = useState(0)

  // ボタンの位置が変わったときにモーダルの位置を更新
  useEffect(() => {
    if (showModal && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      // API タブページの幅を取得するため、親要素を探す
      const container = buttonRef.current.closest('[style*="position: relative"]')
      if (container) {
        const containerRect = container.getBoundingClientRect()
        setModalTop(rect.bottom + 4)
        setModalLeft(containerRect.left)
        setModalWidth(containerRect.width)
      }
    }
  }, [showModal])

  const handleReuse = (apiObject: ApiObject): void => {
    setUrl(apiObject.url)
    setSelectedMethod(apiObject.method)
    if (apiObject.requestBody !== undefined) {
      setParams(JSON.stringify(apiObject.requestBody, null, 2))
    } else {
      setParams('')
    }
    // フォームの位置までスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleMethodSelect = (
    method: string,
    methodParams?: Record<string, unknown> | unknown[],
  ): void => {
    setSelectedMethod(method)
    if (methodParams) {
      setParams(JSON.stringify(methodParams, null, 2))
    }
    setShowModal(false)
  }

  return (
    <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {showModal && (
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
          onClick={() => setShowModal(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setShowModal(false)
            }
          }}
        />
      )}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            top: `${modalTop}px`,
            left: `${modalLeft}px`,
            width: `${modalWidth}px`,
            backgroundColor: '#1a1a1a',
            border: '1px solid #444',
            borderRadius: '8px',
            maxHeight: `calc(100vh - ${modalTop}px - 20px)`,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            padding: '20px',
          }}
        >
          <Button
            variant="outline-light"
            size="sm"
            onClick={() => setShowModal(false)}
            style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              zIndex: 1,
            }}
          >
            ×
          </Button>
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
                    color: '#ffa500',
                    fontWeight: 'bold',
                    marginBottom: '12px',
                    fontSize: '1.1rem',
                  }}
                >
                  {groupName}
                </div>
                <Row>
                  {templates.map((template) => (
                    <Col key={template.method} xs={6} className="mb-2">
                      <Button
                        variant={selectedMethod === template.method ? 'primary' : 'secondary'}
                        size="sm"
                        style={{
                          width: '100%',
                          fontSize: '1.1rem',
                          padding: '12px',
                          fontWeight: 'bold',
                        }}
                        onClick={() => handleMethodSelect(template.method, template.params)}
                      >
                        {template.method.replace('Sora_', '')}
                      </Button>
                    </Col>
                  ))}
                </Row>
              </div>
            ))
          })()}
        </div>
      )}
      <ApiForm
        url={url}
        setUrl={setUrl}
        selectedMethod={selectedMethod}
        params={params}
        setParams={setParams}
        setShowModal={setShowModal}
        buttonRef={buttonRef}
      />
      {apiObjects.length > 0 && (
        <>
          <div className="py-1">
            <h5>API Results</h5>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <ClearButton />
              <div style={{ color: '#aaa', fontSize: '0.85rem' }}>{apiObjects.length} 件を表示</div>
            </div>
          </div>
          <div style={{ overflowY: 'scroll', flex: 1 }}>
            {apiObjects.map((apiObject, index) => {
              const key = `${apiObject.timestamp}-${index}`
              return <ApiObjectItem key={key} apiObject={apiObject} onReuse={handleReuse} />
            })}
          </div>
        </>
      )}
    </div>
  )
}
