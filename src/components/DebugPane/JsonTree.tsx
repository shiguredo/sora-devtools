import type React from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'

type JsonTreeProps = {
  data: unknown
  prevData?: unknown
  name?: string
  isLast?: boolean
  level?: number
}

/**
 * 深い等価比較関数
 * - 精度: 100%（すべてのネストレベルで値の変更を検出）
 * - パフォーマンス: JSON.stringify より高速
 *   - 早期リターン: 参照が同じ場合は即座に true を返す（O(1)）
 *   - 差分発見時は即座に false を返す（全体走査不要）
 *   - 文字列化のオーバーヘッドなし
 *
 * WebRTC stats に最適:
 * - ネストが浅い（3-4レベル）
 * - 変化するプロパティは一部のみ（bytesReceived など）
 * - 固定プロパティ（id, type）は早期スキップ
 */
const deepEqual = (a: unknown, b: unknown): boolean => {
  // 参照が同じなら等しい（最重要な最適化）
  if (a === b) return true

  // null/undefined のチェック
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b
  }

  // 型が異なれば不等
  if (typeof a !== typeof b) return false

  // プリミティブ型の場合、a === b が false だったのでここに到達
  // つまり値が異なるため不等
  if (typeof a !== 'object') return false

  // 配列の深い比較
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false
    }
    return true
  }

  // 配列と非配列の混在
  if (Array.isArray(a) !== Array.isArray(b)) return false

  // オブジェクトの深い比較
  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj)

  // キー数が異なれば不等
  if (aKeys.length !== Object.keys(bObj).length) return false

  // 各キーと値を再帰的に比較
  for (const key of aKeys) {
    if (!(key in bObj)) return false
    if (!deepEqual(aObj[key], bObj[key])) return false
  }

  return true
}

export const JsonTree: React.FC<JsonTreeProps> = ({
  data,
  prevData,
  name,
  isLast = true,
  level = 0,
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false)

  // 前回の data を保存（初期値は prevData を使用し、再マウント時も前回値を参照可能にする）
  const prevDataRef = useRef<unknown>(prevData)

  // 変更検出: 深い比較で値の変更を検出
  useEffect(() => {
    // 前回の値が存在し、値が変更された場合はハイライト表示
    if (prevDataRef.current !== undefined && !deepEqual(prevDataRef.current, data)) {
      setIsHighlighted(true)
      const timer = setTimeout(() => setIsHighlighted(false), 1000)

      // 今回の data を次回の比較用に保存
      prevDataRef.current = data

      return () => clearTimeout(timer)
    }

    // 初回またはハイライト不要時も、次回比較用に現在の値を保存
    prevDataRef.current = data
  }, [data])

  // スタイルオブジェクトをメモ化して再レンダリング最適化
  const highlightStyle = useMemo(
    () =>
      isHighlighted
        ? {
            padding: '2px 4px',
            borderRadius: '2px',
            backgroundColor: '#0071bc',
            textShadow: '0 0 1px currentColor',
          }
        : {
            padding: '2px 4px',
            borderRadius: '2px',
          },
    [isHighlighted],
  )

  const renderPrimitive = (value: unknown) => {
    if (value === null)
      return (
        <span className="italic" style={highlightStyle}>
          null
        </span>
      )
    if (value === undefined)
      return (
        <span className="italic" style={highlightStyle}>
          undefined
        </span>
      )
    if (typeof value === 'string') return <span style={highlightStyle}>"{value}"</span>
    if (typeof value === 'number') return <span style={highlightStyle}>{value}</span>
    if (typeof value === 'boolean') return <span style={highlightStyle}>{value.toString()}</span>
    return <span style={highlightStyle}>{String(value)}</span>
  }

  const isPrimitive = (value: unknown) => {
    return value === null || value === undefined || typeof value !== 'object'
  }

  const isArray = (value: unknown): value is unknown[] => {
    return Array.isArray(value)
  }

  const isObject = (value: unknown): value is Record<string, unknown> => {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }

  if (isPrimitive(data)) {
    return (
      <div>
        {name && (
          <>
            <span style={highlightStyle}>{name}</span>
            <span>: </span>
          </>
        )}
        {renderPrimitive(data)}
        {!isLast && <span>,</span>}
      </div>
    )
  }

  const entries = isArray(data)
    ? data.map((item, index) => ({ key: String(index), value: item }))
    : isObject(data)
      ? Object.entries(data).map(([key, value]) => ({ key, value }))
      : []

  const bracketOpen = isArray(data) ? '[' : '{'
  const bracketClose = isArray(data) ? ']' : '}'

  return (
    <div>
      <div>
        {name && (
          <>
            <span style={highlightStyle}>{name}</span>
            <span>: </span>
          </>
        )}
        <span>{bracketOpen}</span>
      </div>
      <div style={{ marginLeft: '1.25rem' }}>
        {entries.map((entry, index) => {
          const prevValue = isArray(prevData)
            ? prevData[Number(entry.key)]
            : isObject(prevData)
              ? prevData[entry.key]
              : undefined

          return (
            <JsonTree
              key={entry.key}
              data={entry.value}
              prevData={prevValue}
              name={isArray(data) ? undefined : entry.key}
              isLast={index === entries.length - 1}
              level={level + 1}
            />
          )
        })}
      </div>
      <div>
        <span>{bracketClose}</span>
        {!isLast && <span>,</span>}
      </div>
    </div>
  )
}
