import { useSignal } from '@preact/signals'
import type React from 'react'
import { useEffect, useRef } from 'react'

type DropdownItem = {
  label: string
  value: string
  disabled?: boolean
}

type Props = {
  inputClassName?: string
  inputValue: string
  inputPlaceholder?: string
  inputDisabled?: boolean
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  dropdownDisabled?: boolean
  items: DropdownItem[]
  onItemClick: (value: string) => void
}

export const DropdownInput: React.FC<Props> = (props) => {
  const {
    inputClassName = '',
    inputValue,
    inputPlaceholder,
    inputDisabled = false,
    onInputChange,
    dropdownDisabled = false,
    items,
    onItemClick,
  } = props

  const isOpen = useSignal(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        isOpen.value = false
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (!dropdownDisabled) {
      isOpen.value = !isOpen.value
    }
  }

  const handleItemClick = (value: string, disabled?: boolean) => {
    if (disabled) return
    onItemClick(value)
    isOpen.value = false
  }

  return (
    <div className="input-group" ref={containerRef}>
      <input
        type="text"
        className={`form-control ${inputClassName}`}
        value={inputValue}
        onChange={onInputChange}
        placeholder={inputPlaceholder}
        disabled={inputDisabled}
      />
      <button
        type="button"
        className="btn btn-outline-secondary form-template-dropdown dropdown-toggle"
        onClick={handleToggle}
        disabled={dropdownDisabled}
        aria-expanded={isOpen.value}
      />
      {isOpen.value && (
        <ul className="dropdown-menu dropdown-menu-end show" style={{ position: 'absolute', right: 0 }}>
          {items.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                className={`dropdown-item${item.disabled ? ' disabled' : ''}`}
                onClick={() => handleItemClick(item.value, item.disabled)}
                disabled={item.disabled}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
