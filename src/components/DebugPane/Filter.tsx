import type React from 'react'
import { FormControl, FormGroup, FormLabel } from 'react-bootstrap'

import { setDebugFilterText } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

export const DebugFilter: React.FC = () => {
  const debugFilterText = useSoraDevtoolsStore((state) => state.debugFilterText)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setDebugFilterText(event.target.value)
  }
  return (
    <FormGroup className="form-inline debug-filter" controlId="channelId">
      <FormLabel className="text-white">Filter:</FormLabel>
      <FormControl
        type="text"
        placeholder="Filter"
        value={debugFilterText}
        onChange={onChange}
        autoComplete="off"
      />
    </FormGroup>
  )
}
