import React, { useEffect, useState } from 'react'
import type { DraggableData, DraggableEvent } from 'react-draggable'
import Draggable from 'react-draggable'

import { useAppSelector } from '@/app/hooks'

const MAX_CROP_AREA_WIDTH = 640
const CROP_AREA_MARGIN = 40

function calcCropAreaWidth(windowOuterWidth: number): number {
  if (windowOuterWidth < MAX_CROP_AREA_WIDTH + CROP_AREA_MARGIN) {
    return windowOuterWidth - CROP_AREA_MARGIN
  }
  return MAX_CROP_AREA_WIDTH
}

export const MediacaptureRegionTarget: React.FC = () => {
  const mediaType = useAppSelector((state) => state.mediaType)
  const defaultPosition = { x: 100, y: 100 }
  const [postion, setPosition] = useState<{ x: number; y: number }>(defaultPosition)
  const [cropAreaWidth, setCropAreaWidth] = useState(0)
  const onDrag = (_: DraggableEvent, data: DraggableData): void => {
    setPosition({ x: data.x, y: data.y })
  }
  useEffect(() => {
    const resizeEventListener = (): void => {
      if (window !== undefined) {
        setCropAreaWidth(calcCropAreaWidth(window.innerWidth))
      }
    }
    window.addEventListener('resize', resizeEventListener)
    resizeEventListener()
    return () => {
      window.removeEventListener('resize', resizeEventListener)
    }
  }, [])
  if (mediaType !== 'mediacaptureRegion') {
    return null
  }
  return (
    <Draggable position={postion} onDrag={onDrag} defaultPosition={defaultPosition}>
      <div
        id="cropArea"
        className="cropArea"
        style={{ width: `${cropAreaWidth}px`, height: `${Math.floor((cropAreaWidth / 4) * 3)}px` }}
      ></div>
    </Draggable>
  )
}
