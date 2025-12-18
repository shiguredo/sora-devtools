import { useSignal } from '@preact/signals'
import type { FunctionComponent } from 'preact'
import type { TargetedEvent } from 'preact/compat'
import { useEffect, useRef } from 'preact/hooks'

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
  onInputChange: (event: TargetedEvent<HTMLInputElement>) => void
  dropdownDisabled?: boolean
  items: DropdownItem[]
  onItemClick: (value: string) => void
}

export const DropdownInput: FunctionComponent<Props> = (props) => {
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
    <div className="flex relative" ref={containerRef}>
      <input
        type="text"
        className={`w-full px-3 py-2 border border-gray-300 rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500 ${inputClassName}`}
        value={inputValue}
        onChange={onInputChange}
        placeholder={inputPlaceholder}
        disabled={inputDisabled}
      />
      <button
        type="button"
        className="px-3 py-2 border border-gray-500 text-gray-600 hover:bg-gray-500 hover:text-white form-template-dropdown rounded-r"
        onClick={handleToggle}
        disabled={dropdownDisabled}
        aria-expanded={isOpen.value}
      />
      {isOpen.value && (
        <ul className="absolute right-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10">
          {items.map((item) => (
            <li key={item.value}>
              <button
                type="button"
                className={`block w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100${item.disabled ? ' disabled' : ''}`}
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
