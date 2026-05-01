// src/components/MusicalScore.tsx

import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Navigation } from 'lucide-react';
import { KeyboardHint } from './KeyboardHint';

interface MusicalScoreProps {
  currentSong: string;
  isPlaying: boolean;
  isMuted: boolean;
  isPracticeMode: boolean;
  currentNoteIndex: number;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onShowHint: () => void;
  songData?: {
    notes: string[];
    durations: number[];
    title: string;
  };
  keyboardMapping: { [key: string]: { note: string; octave: number } };
  showHint: boolean;
  onCloseHint: () => void;
}

export const MusicalScore: React.FC<MusicalScoreProps> = ({
  isPlaying,
  isMuted,
  isPracticeMode,
  currentNoteIndex,
  onTogglePlay,
  onToggleMute,
  onShowHint,
  songData,
  showHint,
  onCloseHint,
}) => {
  const [autoScroll, setAutoScroll] = useState(true);
  const notesContainerRef = useRef<HTMLDivElement>(null);
  const currentNoteRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && currentNoteRef.current && notesContainerRef.current) {
      const container = notesContainerRef.current;
      const currentNote = currentNoteRef.current;

      const containerWidth = container.clientWidth;
      const noteOffsetLeft = currentNote.offsetLeft;
      const noteWidth = currentNote.clientWidth;

      // Calculate scroll position to center the current note
      const scrollLeft = noteOffsetLeft - (containerWidth / 2) + (noteWidth / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentNoteIndex, autoScroll]);

  if (!songData) {
    return (
      <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-white mb-3">Musical Score</h3>
          <p className="text-purple-300">Select a song to see the musical notation</p>
        </div>
      </div>
    );
  }

  const parseNoteSymbol = (note: string) => {
    if (note === 'rest') return { base: 'Rest', accidental: '', octave: '' };
    const match = note.match(/^([A-G])([#b]?)(\d+)$/);
    if (match) {
      const [, base, accidental, octave] = match;
      return { base, accidental, octave };
    }
    // fallback for non-standard notes
    return { base: note.replace(/\d+/, ""), accidental: "", octave: "" };
  };

  const getNoteDisplay = (note: string) => {
    const { base, accidental, octave } = parseNoteSymbol(note);
    if (base === 'Rest') return 'Rest';

    const accidentalSymbol = accidental === '#' ? '♯' : accidental === 'b' ? '♭' : '';
    return (
      <>
        <span>{base}{accidentalSymbol}</span>
        <sub className="opacity-60">{octave}</sub>
      </>
    );
  };

  const getNoteDuration = (duration: number) => {
    if (duration >= 2) return '𝅝'; // Whole note
    if (duration >= 1) return '𝅗𝅥'; // Half note
    if (duration >= 0.5) return '𝅘𝅥'; // Quarter note
    if (duration >= 0.25) return '𝅘𝅥𝅮'; // Eighth note
    if (duration >= 0.125) return '𝅘𝅥𝅯'; // Sixteenth note
    if (duration >= 0.0625) return '𝅘𝅥𝅰'; // Thirty-second note
    return '𝅘𝅥𝅱'; // Sixty-fourth note or shorter
  };

  const getRestDuration = (duration: number) => {
    if (duration >= 2) return '𝄻'; // Whole rest
    if (duration >= 1) return '𝄼'; // Half rest
    if (duration >= 0.5) return '𝄽'; // Quarter rest
    if (duration >= 0.25) return '𝄾'; // Eighth rest
    if (duration >= 0.125) return '𝄿'; // Sixteenth rest
    if (duration >= 0.0625) return '𝅀'; // Thirty-second rest
    return '𝅁'; // Sixty-fourth rest or shorter
  };

  const getStaffPosition = (note: string): { top: number; needsLedger: boolean; ledgerLines: number[] } => {
    const { base, accidental, octave } = parseNoteSymbol(note);

    if (note === 'rest') {
      return { top: 44, needsLedger: false, ledgerLines: [] };
    }

    // Define the position of middle C (C4) - this is our reference point
    const middleCPosition = 70; // Position of middle C (ledger line below staff)

    // Define the distance between staff lines (in pixels)
    const lineSpacing = 12;

    // Define note positions relative to middle C
    // Each step up or down in the musical alphabet moves by half a line spacing (6px)
    const notePositions: Record<string, number> = {
      'C': 0,
      'C#': 0, 'Db': 0,
      'D': -1,
      'D#': -1, 'Eb': -1,
      'E': -2,
      'F': -3,
      'F#': -3, 'Gb': -3,
      'G': -4,
      'G#': -4, 'Ab': -4,
      'A': -5,
      'A#': -5, 'Bb': -5,
      'B': -6
    };
