import React, { useState, useRef } from 'react';
import { nanoid } from 'nanoid';
import { Plus, Minus, StickyNote, Music } from 'lucide-react';
import Note from './Note';
import AudioNote from './AudioNote';

interface NoteData {
  id: string;
  type: 'sticky' | 'audio';
  content: string;
  position: { x: number; y: number };
  audioUrl?: string;
  metadata?: {
    title?: string;
    artist?: string;
    coverUrl?: string;
  };
}

export default function Whiteboard() {
  const [notes, setNotes] = useState<NoteData[]>([]);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddNote = () => {
    const newNote: NoteData = {
      id: nanoid(),
      type: 'sticky',
      content: 'New note',
      position: { x: Math.random() * 200, y: Math.random() * 200 },
    };
    setNotes([...notes, newNote]);
  };

  const handleAddAudio = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newNotes: NoteData[] = files.map((file, index) => {
      const audioUrl = URL.createObjectURL(file);
      const placeholderCover = `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bXVzaWN8ZW58MHx8MHx8fDA%3D`;

      return {
        id: nanoid(),
        type: 'audio',
        content: file.name,
        position: { 
          x: Math.random() * 200 + (index * 20), 
          y: Math.random() * 200 + (index * 20) 
        },
        audioUrl,
        metadata: {
          title: file.name.replace(/\.[^/.]+$/, ""),
          coverUrl: placeholderCover
        }
      };
    });

    setNotes([...notes, ...newNotes]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNotePosition = (id: string, position: { x: number; y: number }) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, position } : note
    ));
  };

  const handleNoteContent = (id: string, content: string) => {
    setNotes(notes.map(note => 
      note.id === id ? { ...note, content } : note
    ));
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gray-50">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={handleAddNote}
          className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100"
          title="Add Note"
        >
          <StickyNote className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100"
          title="Add Audio"
        >
          <Music className="w-6 h-6 text-gray-700" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          multiple
          className="hidden"
          onChange={handleAddAudio}
        />
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-lg p-2 space-y-2">
        <button
          onClick={() => setZoom(z => Math.min(z + 0.1, 2))}
          className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100"
          title="Zoom In"
        >
          <Plus className="w-6 h-6 text-gray-700" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}
          className="flex items-center justify-center w-10 h-10 rounded hover:bg-gray-100"
          title="Zoom Out"
        >
          <Minus className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Canvas */}
      <div
        className="w-full h-full relative"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: '0 0',
          width: `${100/zoom}%`,
          height: `${100/zoom}%`
        }}
      >
        {notes.map(note => (
          note.type === 'sticky' ? (
            <Note
              key={note.id}
              id={note.id}
              content={note.content}
              position={note.position}
              onPositionChange={handleNotePosition}
              onContentChange={handleNoteContent}
              onDelete={handleDeleteNote}
            />
          ) : (
            <AudioNote
              key={note.id}
              id={note.id}
              audioUrl={note.audioUrl!}
              metadata={note.metadata!}
              position={note.position}
              onPositionChange={handleNotePosition}
              onDelete={handleDeleteNote}
            />
          )
        ))}
      </div>
    </div>
  );
}