import type React from 'react'
import { useState, useEffect, useRef } from 'react'

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
    const highlightClasses = isHighlighted ? 'bg-cyan-200/20 rounded px-1 py-0.5' : ''
    
    // ハイライト時は明るい色に
    const nullColor = isHighlighted ? '#a8b2be' : '#8b95a1'
    const stringColor = isHighlighted ? '#b8e5ca' : '#a8d5ba'
    const numberColor = isHighlighted ? '#7ba9d3' : '#5b8fb9'
    const booleanColor = isHighlighted ? '#f4c5db' : '#e4b5cb'
    const defaultColor = isHighlighted ? '#d5eaf8' : '#c5dae8'
    
    if (value === null) return <span className={`italic ${baseClasses} ${highlightClasses}`} style={{ color: nullColor }}>null</span>
    if (value === undefined) return <span className={`italic ${baseClasses} ${highlightClasses}`} style={{ color: nullColor }}>undefined</span>
    if (typeof value === 'string') return <span className={`${baseClasses} ${highlightClasses}`} style={{ color: stringColor }}>"{value}"</span>
    if (typeof value === 'number') return <span className={`font-medium ${baseClasses} ${highlightClasses}`} style={{ color: numberColor }}>{value}</span>
    if (typeof value === 'boolean') return <span className={`${baseClasses} ${highlightClasses}`} style={{ color: booleanColor }}>{value.toString()}</span>
    return <span className={`${baseClasses} ${highlightClasses}`} style={{ color: defaultColor }}>{String(value)}</span>
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
  
  const highlightClasses = isHighlighted ? 'bg-cyan-200/15 rounded p-0.5 transition-all duration-300' : ''
  
  if (isPrimitive(data)) {
    return (
      <div>
        {name && (
          <>
            <span className="text-[#a0d8ef]">{name}</span>
            <span className="text-[#7a8690]">: </span>
          </>
        )}
        {renderPrimitive(data)}
        {!isLast && <span className="text-[#7a8690]">,</span>}
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
            <span className="text-[#a0d8ef]">{name}</span>
            <span className="text-[#7a8690] mx-1">:</span>
          </>
        )}
        <span className="text-gray-600">{bracketOpen}</span>
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
        <span className="text-gray-600">{bracketClose}</span>
        {!isLast && <span className="text-[#7a8690]">,</span>}
      </div>
    </div>
  )
}