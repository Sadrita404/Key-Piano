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