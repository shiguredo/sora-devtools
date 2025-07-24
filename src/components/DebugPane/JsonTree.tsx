import React, { useState, useEffect, useRef } from 'react'

const jsonColors = {
  light: {
    background: '#fafbfc',
    text: '#24292e',
    key: '#5a8bb0',
    string: '#6aab73',
    number: '#d68a3a',
    boolean: '#c678dd',
    null: '#999',
    punctuation: '#586069'
  },
  dark: {
    background: '#1e2329',
    text: '#abb2bf',
    key: '#a0d8ef',
    string: '#89ca78',
    number: '#e6b673',
    boolean: '#d19a66',
    null: '#5c6370',
    punctuation: '#7a8290'
  },
  changes: {
    modified: '#fff3cd',
    modifiedStrong: '#ffe0b2',
    added: '#d4f5d4',
    removed: '#ffdddd'
  }
}

type JsonTreeProps = {
  data: unknown
  prevData?: unknown
  name?: string
  isLast?: boolean
  isArrayElement?: boolean
  level?: number
}

export const JsonTree: React.FC<JsonTreeProps> = ({ 
  data, 
  prevData,
  name, 
  isLast = true, 
  isArrayElement = false,
  level = 0 
}) => {
  const [isHighlighted, setIsHighlighted] = useState(false)
  const prevDataRef = useRef(prevData)
  
  useEffect(() => {
    if (prevDataRef.current !== undefined && 
        JSON.stringify(prevDataRef.current) !== JSON.stringify(data)) {
      setIsHighlighted(true)
      const timer = setTimeout(() => setIsHighlighted(false), 1000)
      return () => clearTimeout(timer)
    }
    prevDataRef.current = data
  }, [data])
  
  const renderPrimitive = (value: unknown) => {
    const baseStyle = { transition: 'all 0.3s ease' }
    const highlightStyle = isHighlighted ? {
      backgroundColor: 'rgba(160, 216, 239, 0.2)',
      borderRadius: '3px',
      padding: '1px 4px',
    } : {}
    
    // ハイライト時は明るい色に
    const nullColor = isHighlighted ? '#a8b2be' : '#8b95a1'
    const stringColor = isHighlighted ? '#b8e5ca' : '#a8d5ba'
    const numberColor = isHighlighted ? '#7ba9d3' : '#5b8fb9'
    const booleanColor = isHighlighted ? '#f4c5db' : '#e4b5cb'
    const defaultColor = isHighlighted ? '#d5eaf8' : '#c5dae8'
    
    if (value === null) return <span style={{ color: nullColor, fontStyle: 'italic', ...baseStyle, ...highlightStyle }}>null</span>
    if (value === undefined) return <span style={{ color: nullColor, fontStyle: 'italic', ...baseStyle, ...highlightStyle }}>undefined</span>
    if (typeof value === 'string') return <span style={{ color: stringColor, ...baseStyle, ...highlightStyle }}>"{value}"</span>
    if (typeof value === 'number') return <span style={{ color: numberColor, fontWeight: '500', ...baseStyle, ...highlightStyle }}>{value}</span>
    if (typeof value === 'boolean') return <span style={{ color: booleanColor, ...baseStyle, ...highlightStyle }}>{value.toString()}</span>
    return <span style={{ color: defaultColor, ...baseStyle, ...highlightStyle }}>{String(value)}</span>
  }
  
  const isPrimitive = (value: unknown) => {
    return value === null || 
           value === undefined || 
           typeof value !== 'object'
  }
  
  const isArray = (value: unknown): value is unknown[] => {
    return Array.isArray(value)
  }
  
  const isObject = (value: unknown): value is Record<string, unknown> => {
    return value !== null && typeof value === 'object' && !Array.isArray(value)
  }
  
  const highlightStyle = isHighlighted ? {
    backgroundColor: 'rgba(160, 216, 239, 0.15)',
    borderRadius: '4px',
    padding: '3px',
    transition: 'all 0.3s ease'
  } : {}
  
  if (isPrimitive(data)) {
    return (
      <div>
        {name && (
          <>
            <span style={{ color: '#a0d8ef' }}>{name}</span>
            <span style={{ color: '#7a8690' }}>: </span>
          </>
        )}
        {renderPrimitive(data)}
        {!isLast && <span style={{ color: '#7a8690' }}>,</span>}
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
    <div style={highlightStyle}>
      <div>
        {name && (
          <>
            <span style={{ color: '#a0d8ef' }}>{name}</span>
            <span style={{ color: '#7a8690' }} className="mx-1">:</span>
          </>
        )}
        <span style={{ color: '#4a5568' }}>{bracketOpen}</span>
      </div>
      <div style={{ marginLeft: '20px' }}>
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
              isArrayElement={isArray(data)}
              level={level + 1}
            />
          )
        })}
      </div>
      <div>
        <span style={{ color: '#4a5568' }}>{bracketClose}</span>
        {!isLast && <span style={{ color: '#7a8690' }}>,</span>}
      </div>
    </div>
  )
}