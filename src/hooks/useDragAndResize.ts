import { useState, useEffect, RefObject } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Dimensions {
  width: number;
  height: number;
}

interface UseDragAndResizeProps {
  elementRef: RefObject<HTMLElement>;
  position: Position;
  onPositionChange: (position: Position) => void;
  minWidth?: number;
  minHeight?: number;
}

export function useDragAndResize({
  elementRef,
  position,
  onPositionChange,
  minWidth = 192,
  minHeight = 192
}: UseDragAndResizeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState<Dimensions>({ width: minWidth, height: minHeight });
  const [startResizeDimensions, setStartResizeDimensions] = useState<Dimensions>({ width: 0, height: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        onPositionChange({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        setDimensions({
          width: Math.max(minWidth, startResizeDimensions.width + deltaX),
          height: Math.max(minHeight, startResizeDimensions.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragOffset, onPositionChange, resizeStart, startResizeDimensions, minWidth, minHeight]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    
    if (target.classList.contains('resize-handle')) {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setStartResizeDimensions({ width: rect.width, height: rect.height });
        setResizeStart({ x: e.clientX, y: e.clientY });
        setIsResizing(true);
      }
    } else if (target.classList.contains('drag-handle') || target === elementRef.current) {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
        setIsDragging(true);
      }
    }
  };

  return {
    isDragging,
    isResizing,
    dimensions,
    handleMouseDown
  };
}