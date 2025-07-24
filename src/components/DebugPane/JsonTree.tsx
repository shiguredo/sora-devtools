import type React from 'react'
import { useState, useEffect, useRef } from 'react'

// Color Universal Design - Deep Navy theme
// Based on CUD guidelines with very dark blue background
const cudBlueTheme = {
  background: '#000814',  // 濃紺 (Deep Navy) - Very dark blue
  // CUD colors with maximum contrast for dark background
  key: '#7DD3FC',        // 明るい青 (Light Blue) - Maximum contrast
  string: '#6EE7B7',     // 明るいエメラルド (Light Emerald)  
  number: '#93C5FD',     // 明るいスカイブルー (Light Sky Blue)
  boolean: '#FDE047',    // 明るい黄 (Bright Yellow) - Maximum contrast
  null: '#CBD5E1',       // 明るいグレー (Light Gray)
  punctuation: '#7DD3FC', // 明るい青 (Light Blue)
}

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
    const baseClasses = 'transition-all duration-300 ease-in-out'
    const highlightClasses = isHighlighted ? 'bg-blue-400/20 rounded px-1 py-0.5' : ''
    
    if (value === null) return <span className={`italic ${baseClasses} ${highlightClasses}`} style={{ color: cudBlueTheme.null }}>null</span>
    if (value === undefined) return <span className={`italic ${baseClasses} ${highlightClasses}`} style={{ color: cudBlueTheme.null }}>undefined</span>
    if (typeof value === 'string') return <span className={`${baseClasses} ${highlightClasses}`} style={{ color: cudBlueTheme.string }}>"{value}"</span>
    if (typeof value === 'number') return <span className={`${baseClasses} ${highlightClasses}`} style={{ color: cudBlueTheme.number }}>{value}</span>
    if (typeof value === 'boolean') return <span className={`${baseClasses} ${highlightClasses}`} style={{ color: cudBlueTheme.boolean }}>{value.toString()}</span>
    return <span className={`${baseClasses} ${highlightClasses}`} style={{ color: cudBlueTheme.foreground }}>{String(value)}</span>
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
  
  const highlightClasses = isHighlighted ? 'bg-blue-400/15 rounded p-0.5 transition-all duration-300' : ''
  
  if (isPrimitive(data)) {
    return (
      <div>
        {name && (
          <>
            <span style={{ color: cudBlueTheme.key }}>{name}</span>
            <span style={{ color: cudBlueTheme.punctuation }}>: </span>
          </>
        )}
        {renderPrimitive(data)}
        {!isLast && <span style={{ color: cudBlueTheme.punctuation }}>,</span>}
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
    <div className={highlightClasses}>
      <div>
        {name && (
          <>
            <span style={{ color: cudBlueTheme.key }}>{name}</span>
            <span className="mx-1" style={{ color: cudBlueTheme.punctuation }}>:</span>
          </>
        )}
        <span style={{ color: cudBlueTheme.punctuation }}>{bracketOpen}</span>
      </div>
      <div className="ml-5">
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
        <span style={{ color: cudBlueTheme.punctuation }}>{bracketClose}</span>
        {!isLast && <span style={{ color: cudBlueTheme.punctuation }}>,</span>}
      </div>
    </div>
  )
}