import React, { useRef } from 'react';
import { X } from 'lucide-react';
import { useDragAndResize } from '../hooks/useDragAndResize';

interface NoteProps {
  id: string;
  content: string;
  position: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onContentChange: (id: string, content: string) => void;
  onDelete: (id: string) => void;
}

export default function Note({
  id,
  content,
  position,
  onPositionChange,
  onContentChange,
  onDelete
}: NoteProps) {
  const noteRef = useRef<HTMLDivElement>(null);
  
  const { isDragging, dimensions, handleMouseDown } = useDragAndResize({
    elementRef: noteRef,
    position,
    onPositionChange: (newPosition) => onPositionChange(id, newPosition),
    minWidth: 192,
    minHeight: 192
  });

  return (
    <div
      ref={noteRef}
      className={`absolute bg-yellow-100 rounded-lg shadow-lg p-4 drag-handle
        ${isDragging ? 'shadow-xl cursor-grabbing' : 'cursor-grab'}`}
      style={{
        left: position.x,
        top: position.y,
        width: dimensions.width,
        height: dimensions.height,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        onClick={() => onDelete(id)}
      >
        <X className="w-4 h-4" />
      </button>
      <textarea
        className="w-full h-[calc(100%-1.5rem)] bg-transparent resize-none focus:outline-none"
        value={content}
        onChange={(e) => onContentChange(id, e.target.value)}
        onClick={(e) => e.stopPropagation()}
      />
      <div 
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize
          after:content-[''] after:absolute after:right-1 after:bottom-1
          after:w-2 after:h-2 after:border-r-2 after:border-b-2 after:border-gray-400"
      />
    </div>
  );
}