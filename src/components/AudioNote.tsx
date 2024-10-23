import React, { useRef, useEffect } from 'react';
import { X, Play, Pause } from 'lucide-react';
import { useDragAndResize } from '../hooks/useDragAndResize';

interface AudioNoteProps {
  id: string;
  audioUrl: string;
  metadata: {
    title?: string;
    artist?: string;
    coverUrl?: string;
  };
  position: { x: number; y: number };
  onPositionChange: (id: string, position: { x: number; y: number }) => void;
  onDelete: (id: string) => void;
}

export default function AudioNote({
  id,
  audioUrl,
  metadata,
  position,
  onPositionChange,
  onDelete
}: AudioNoteProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [duration, setDuration] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const noteRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const { isDragging, dimensions, handleMouseDown } = useDragAndResize({
    elementRef: noteRef,
    position,
    onPositionChange: (newPosition) => onPositionChange(id, newPosition),
    minWidth: 256,
    minHeight: 400
  });

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, []);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (progressRef.current && audioRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      const newTime = pos * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const coverHeight = Math.min(dimensions.height * 0.6, dimensions.width);

  return (
    <div
      ref={noteRef}
      className={`absolute bg-white rounded-lg shadow-lg overflow-hidden
        ${isDragging ? 'shadow-xl' : ''}`}
      style={{
        left: position.x,
        top: position.y,
        width: dimensions.width,
        height: dimensions.height,
        touchAction: 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div 
        className="drag-handle relative bg-gray-200 cursor-move"
        style={{ height: coverHeight }}
      >
        <img
          src={metadata.coverUrl}
          alt={metadata.title}
          className="w-full h-full object-cover pointer-events-none"
        />
        <button
          className="absolute top-2 right-2 text-white bg-gray-800/50 rounded-full p-1
            hover:bg-gray-800/75 z-10"
          onClick={handleDelete}
        >
          <X className="w-4 h-4" />
        </button>
        <button
          className="absolute inset-0 flex items-center justify-center bg-black/20
            hover:bg-black/30 transition-colors z-10"
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="w-12 h-12 text-white" />
          ) : (
            <Play className="w-12 h-12 text-white" />
          )}
        </button>
      </div>
      <div className="p-4 bg-white">
        <div className="drag-handle cursor-move">
          <h3 className="font-medium text-gray-900 truncate pointer-events-none">
            {metadata.title}
          </h3>
          {metadata.artist && (
            <p className="text-sm text-gray-500 truncate pointer-events-none">
              {metadata.artist}
            </p>
          )}
        </div>
        
        <div className="mt-3 space-y-1">
          <div
            ref={progressRef}
            className="progress-bar h-1.5 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-100"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
      <audio
        ref={audioRef}
        src={audioUrl}
        onEnded={handleAudioEnd}
        className="hidden"
      />
      <div 
        className="resize-handle absolute bottom-0 right-0 w-4 h-4 cursor-se-resize
          after:content-[''] after:absolute after:right-1 after:bottom-1
          after:w-2 after:h-2 after:border-r-2 after:border-b-2 after:border-gray-400"
      />
    </div>
  );
}