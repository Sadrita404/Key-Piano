/ src/components/Piano.ts

import React, { useMemo } from 'react';
import { normalizeNote } from '../utils/musicUtils';

interface PianoProps {
  activeNotes: Set<string>;
  onNotePlay: (note: string) => void;
  onNoteStop: (note: string) => void;
  timingFeedback?: { [key: string]: 'correct' | 'incorrect' | null };
}

const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

// Define the systematic black key block pattern
const blackKeyBlock = [
  { note: 'C#', flatNote: 'Db', position: 36 },   // Between C and D
  { note: 'D#', flatNote: 'Eb', position: 88 },   // Between D and E
  { note: 'F#', flatNote: 'Gb', position: 192 },  // Between F and G
  { note: 'G#', flatNote: 'Ab', position: 244 },  // Between G and A
  { note: 'A#', flatNote: 'Bb', position: 296 },  // Between A and B
];

xport const Piano: React.FC<PianoProps> = ({ activeNotes, onNotePlay, onNoteStop, timingFeedback = {} }) => {
  const octaves = [3, 4, 5];

  const normalizedActiveNotes = useMemo(() => {
    const normalizedSet = new Set<string>();
    activeNotes.forEach(note => {
      normalizedSet.add(normalizeNote(note));
    });
    return normalizedSet;
  }, [activeNotes]);

  // This does the same for the keys of the timingFeedback object.
  const normalizedTimingFeedback = useMemo(() => {
    const normalizedObj: { [key: string]: 'correct' | 'incorrect' | null } = {};
    for (const key in timingFeedback) {
      normalizedObj[normalizeNote(key)] = timingFeedback[key];
    }
    return normalizedObj;
  }, [timingFeedback]);

  // Looks up the piano's note in the PRE-NORMALIZED feedback object.
  const getNoteFeedback = (note: string) => {
    return normalizedTimingFeedback[normalizeNote(note)];
  };

  const handleMouseDown = (note: string, octave: number) => {
    onNotePlay(`${note}${octave}`);
  };

  const handleMouseUp = (note: string, octave: number) => {
    onNoteStop(`${note}${octave}`);
  };

  // Calculate octave width (7 white keys * (width + margin))
  const octaveWidth = 7 * 52; // 48px width + 4px margin

  return (
    <div className="bg-gradient-to-b from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl">
      <div className="relative flex justify-center">
        <div className="relative inline-flex">
          {/* White Keys */}
          <div className="flex">
            {octaves.map(octave => (
              <div key={octave} className="flex">
                {whiteKeys.map(note => {
                  const fullNote = `${note}${octave}`;
                  const feedback = getNoteFeedback(fullNote);
                  const isActive = isNoteActive(fullNote);

                  return (
                    <button
                      key={fullNote}
                      className={`
                        w-12 h-40 mx-0.5 rounded-b-lg transition-all duration-75 transform
                        border-2 border-gray-300 shadow-lg
                        ${feedback === 'correct' ? 'bg-green-400 border-green-500 shadow-green-500/50' : ''}
                        ${feedback === 'incorrect' ? 'bg-red-400 border-red-500 shadow-red-500/50' : ''}
                        ${!feedback && isActive ? 'bg-purple-400 border-purple-500 scale-95 shadow-purple-500/50' : ''}
                        ${!feedback && !isActive ? 'bg-white hover:bg-gray-50 active:scale-95' : ''}
                      `}
                      onMouseDown={() => handleMouseDown(note, octave)}
                      onMouseUp={() => handleMouseUp(note, octave)}
                      onMouseLeave={() => handleMouseUp(note, octave)}
                    >
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-600">
                        {note}{octave}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
