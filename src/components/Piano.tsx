// src/components/Piano.tsx

import React, { useMemo } from 'react';
import { normalizeNote } from '../utils/musicUtils';

interface PianoProps {
  activeNotes: Set<string>;
  onNotePlay: (note: string) => void;
  onNoteStop: (note: string) => void;
  timingFeedback?: { [key: string]: 'correct' | 'incorrect' | null };
}

const whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const blackKeyBlock = [
  { note: 'C#', flatNote: 'Db', position: 36 },
  { note: 'D#', flatNote: 'Eb', position: 88 },
  { note: 'F#', flatNote: 'Gb', position: 192 },
  { note: 'G#', flatNote: 'Ab', position: 244 },
  { note: 'A#', flatNote: 'Bb', position: 296 },
];

export const Piano: React.FC<PianoProps> = ({ activeNotes, onNotePlay, onNoteStop, timingFeedback = {} }) => {
  const octaves = [3, 4, 5];

  const normalizedActiveNotes = useMemo(() => {
    const normalizedSet = new Set<string>();
    activeNotes.forEach(note => normalizedSet.add(normalizeNote(note)));
    return normalizedSet;
  }, [activeNotes]);

  const normalizedTimingFeedback = useMemo(() => {
    const normalizedObj: { [key: string]: 'correct' | 'incorrect' | null } = {};
    for (const key in timingFeedback) {
      normalizedObj[normalizeNote(key)] = timingFeedback[key];
    }
    return normalizedObj;
  }, [timingFeedback]);

  const isNoteActive = (note: string) => normalizedActiveNotes.has(normalizeNote(note));
  const getNoteFeedback = (note: string) => normalizedTimingFeedback[normalizeNote(note)];

  const handleMouseDown = (note: string, octave: number) => onNotePlay(`${note}${octave}`);
  const handleMouseUp = (note: string, octave: number) => onNoteStop(`${note}${octave}`);

  const octaveWidth = 7 * 52;

  // Retro design constants
  const retroBorder = "border-2 border-slate-950";
  const activeShift = "translate-x-[2px] translate-y-[2px] shadow-none";

  return (
    <div className="bg-slate-950 p-6 rounded-none border-t-4 border-slate-800 shadow-[0_8px_0_0_rgba(30,41,59,1)]">
      <div className="relative flex justify-center">
        <div className="relative inline-flex bg-slate-900 p-1 border-2 border-slate-800">
          
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
                        w-12 h-40 mx-0.5 rounded-none transition-all duration-75
                        ${retroBorder}
                        ${feedback === 'correct' ? 'bg-green-500 border-slate-950 shadow-none ' + activeShift : ''}
                        ${feedback === 'incorrect' ? 'bg-red-500 border-slate-950 shadow-none ' + activeShift : ''}
                        ${!feedback && isActive ? 'bg-purple-500 border-slate-950 ' + activeShift : 'shadow-[3px_3px_0_0_rgba(0,0,0,1)]'}
                        ${!feedback && !isActive ? 'bg-slate-50 hover:bg-white active:' + activeShift : ''}
                      `}
                      onMouseDown={() => handleMouseDown(note, octave)}
                      onMouseUp={() => handleMouseUp(note, octave)}
                      onMouseLeave={() => handleMouseUp(note, octave)}
                    >
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-[10px] font-black text-slate-900 uppercase">
                        {note}{octave}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Black Keys */}
          <div className="absolute top-0 left-0 flex pointer-events-none">
            {octaves.map((octave, octaveIndex) => (
              <div key={octave} className="relative">
                {blackKeyBlock.map(({ note, flatNote, position }) => {
                  const absolutePosition = octaveIndex * octaveWidth + position;
                  const sharpNoteFull = `${note}${octave}`;
                  const flatNoteFull = `${flatNote}${octave}`;

                  const feedback = getNoteFeedback(sharpNoteFull);
                  const isActive = isNoteActive(sharpNoteFull) || isNoteActive(flatNoteFull);

                  return (
                    <button
                      key={sharpNoteFull}
                      className={`
                        absolute w-8 h-24 rounded-none transition-all duration-75 pointer-events-auto
                        border-2 border-slate-950
                        ${feedback === 'correct' ? 'bg-green-600 ' + activeShift : ''}
                        ${feedback === 'incorrect' ? 'bg-red-600 ' + activeShift : ''}
                        ${!feedback && isActive ? 'bg-purple-700 ' + activeShift : 'shadow-[2px_2px_0_0_rgba(0,0,0,1)]'}
                        ${!feedback && !isActive ? 'bg-slate-800 hover:bg-slate-700 active:' + activeShift : ''}
                      `}
                      style={{ left: `${absolutePosition}px`, zIndex: 10 }}
                      onMouseDown={() => handleMouseDown(note, octave)}
                      onMouseUp={() => handleMouseUp(note, octave)}
                      onMouseLeave={() => handleMouseUp(note, octave)}
                    >
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 text-[8px] font-bold text-slate-400 text-center leading-none">
                        <div>{note}</div>
                        <div className="border-t border-slate-700 my-1"></div>
                        <div>{flatNote}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};