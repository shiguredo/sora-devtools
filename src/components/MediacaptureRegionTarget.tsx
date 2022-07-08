import React, { useState } from "react";
import type { DraggableData, DraggableEvent } from "react-draggable";
import Draggable from "react-draggable";

export const MediacaptureRegionTarget: React.FC = () => {
  const defaultPosition = { x: 100, y: 100 };
  const [postion, setPosition] = useState<{ x: number; y: number }>(defaultPosition);
  const onDrag = (_: DraggableEvent, data: DraggableData): void => {
    console.log(data);
    setPosition({ x: data.x, y: data.y });
  };
  return (
    <Draggable position={postion} onDrag={onDrag} defaultPosition={defaultPosition}>
      <div id="cropArea" className="cropArea" style={{ width: "100px", height: "100px" }}></div>
    </Draggable>
  );
};
