import { useEffect, useRef, useState } from 'react'
import type React from 'react'

type JsonTreeProps = {
  data: unknown
  prevData?: unknown
  name?: string
  isLast?: boolean
  level?: number
}

export const JsonTree: React.FC<JsonTreeProps> = ({
  data,
  prevData,
  name,
  isLast = true,
  level = 0,
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false)
  const prevDataRef = useRef(prevData)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    if (
      prevDataRef.current !== undefined &&
      JSON.stringify(prevDataRef.current) !== JSON.stringify(data)
    ) {
      setIsHighlighted(true)
      timer = setTimeout(() => setIsHighlighted(false), 1000)
    }

    prevDataRef.current = data

    return () => {
      if (timer !== undefined) {
        clearTimeout(timer)
      }
    }
  }, [data])

  const renderPrimitive = (value: unknown) => {
    const baseStyle = {
      padding: '2px 4px',
      borderRadius: '2px',
    }
    const highlightStyle = isHighlighted
      ? {
          ...baseStyle,
          backgroundColor: '#0071bc',
          textShadow: '0 0 1px currentColor',
        }
      : baseStyle

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

  const baseStyle = {
    padding: '2px 4px',
    borderRadius: '2px',
  }
  const highlightStyle = isHighlighted
    ? {
        ...baseStyle,
        backgroundColor: '#0071bc',
        textShadow: '0 0 1px currentColor',
      }
    : baseStyle

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
