import type React from 'react'

import { setFakeVolume } from '@/app/actions'
import { useSoraDevtoolsStore } from '@/app/store'

import { TooltipFormLabel } from './TooltipFormLabel.tsx'

export const FakeVolumeForm: React.FC = () => {
  const mediaType = useSoraDevtoolsStore((state) => state.mediaType)
  const fakeVolume = useSoraDevtoolsStore((state) => state.fakeVolume)
  const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setFakeVolume(event.target.value)
  }
  if (mediaType !== 'fakeMedia') {
    return null
  }
  return (
    <div className="flex items-center">
      <TooltipFormLabel kind="fakeVolume">fakeVolume:</TooltipFormLabel>
      <input
        type="range"
        min="0"
        max="1"
        step="0.25"
        value={fakeVolume}
        onChange={onChange}
        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  )
}
