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
     const octaveNum = parseInt(octave);
    const octaveOffset = (4 - octaveNum) * 7; // Each octave has 7 staff positions

    // Calculate the note's vertical position
    const noteOffset = notePositions[base + (accidental || '')] || 0;
    const totalOffset = octaveOffset + noteOffset;
    const topPosition = middleCPosition + (totalOffset * (lineSpacing / 2));

    // Determine if ledger lines are needed and which ones
    const ledgerLines: number[] = [];
    let needsLedger = false;

    // Staff line positions (for reference)
    const staffLinePositions = [68, 56, 44, 32, 20]; // E4, G4, B4, D5, F5

    // Check if note is outside the staff
    if (topPosition > staffLinePositions[0] + lineSpacing / 2 ||
      topPosition < staffLinePositions[4] - lineSpacing / 2) {
      needsLedger = true;

      // Calculate ledger line positions
      if (topPosition > staffLinePositions[0]) {
        // Below the staff - add ledger lines
        let currentLedgerPos = staffLinePositions[0] + lineSpacing;
        while (currentLedgerPos <= topPosition + lineSpacing / 2) {
          ledgerLines.push(currentLedgerPos);
          currentLedgerPos += lineSpacing;
        }
      } else {
        // Above the staff - add ledger lines
        let currentLedgerPos = staffLinePositions[4] - lineSpacing;
        while (currentLedgerPos >= topPosition - lineSpacing / 2) {
          ledgerLines.push(currentLedgerPos);
          currentLedgerPos -= lineSpacing;
        }
      }
    }
    return {
      top: topPosition,
      needsLedger,
      ledgerLines
    };
  };

  // Function to get ledger lines based on note position
  const getLedgerLines = (note: string, noteTop: number): number[] => {
    if (note === 'rest') return [];

    const { base, octave } = parseNoteSymbol(note);
    const octaveNum = parseInt(octave);

    // Staff line positions
    const staffLines = [68, 56, 44, 32, 20]; // E4, G4, B4, D5, F5
    const lineSpacing = 12;

    const ledgerLines: number[] = [];

    // Notes below the staff (C4 and lower)
    if (noteTop > staffLines[0]) {
      // Specific ledger line requirements for each note
      if (octaveNum === 4) {
        // C4 needs one ledger line below
        if (base === 'C') {
          ledgerLines.push(staffLines[0] + lineSpacing);
        }
      }
      else if (octaveNum === 3) {
        // B3 needs one ledger line below
        if (base === 'B') {
          ledgerLines.push(staffLines[0] + lineSpacing);
        }
        // A3 needs one ledger line below
        else if (base === 'A') {
          ledgerLines.push(staffLines[0] + lineSpacing);
          ledgerLines.push(staffLines[0] + lineSpacing * 2);
        }
        // G3 needs two ledger lines below
        else if (base === 'G') {
          ledgerLines.push(staffLines[0] + lineSpacing);
          ledgerLines.push(staffLines[0] + lineSpacing * 2);
        }
        // F3 needs three ledger lines below
        else if (base === 'F') {
          ledgerLines.push(staffLines[0] + lineSpacing);
          ledgerLines.push(staffLines[0] + lineSpacing * 2);
          ledgerLines.push(staffLines[0] + lineSpacing * 3);
        }
        // E3 needs three ledger lines below
        else if (base === 'E') {
          ledgerLines.push(staffLines[0] + lineSpacing);
          ledgerLines.push(staffLines[0] + lineSpacing * 2);
          ledgerLines.push(staffLines[0] + lineSpacing * 3);
        }
        // D3 needs three ledger lines below
        else if (base === 'D') {
          ledgerLines.push(staffLines[0] + lineSpacing);
          ledgerLines.push(staffLines[0] + lineSpacing * 2);
          ledgerLines.push(staffLines[0] + lineSpacing * 3);
          ledgerLines.push(staffLines[0] + lineSpacing * 4);
        }
        // C3 needs three ledger lines below
        else if (base === 'C') {
          ledgerLines.push(staffLines[0] + lineSpacing);
          ledgerLines.push(staffLines[0] + lineSpacing * 2);
          ledgerLines.push(staffLines[0] + lineSpacing * 3);
          ledgerLines.push(staffLines[0] + lineSpacing * 4);
        }
      }
    }
    // Notes above the staff (A5 and higher)
    else if (noteTop < staffLines[4]) {
      if (octaveNum === 5) {
        // A5 needs one ledger line above
        if (base === 'A') {
          ledgerLines.push(staffLines[4] - lineSpacing);
        }
        // B5 needs one ledger line above
        else if (base === 'B') {
          ledgerLines.push(staffLines[4] - lineSpacing);
        }
      }
      else if (octaveNum === 6) {
        // C6 needs one ledger line above
        if (base === 'C') {
          ledgerLines.push(staffLines[4] - lineSpacing);
        }
        // D6 needs two ledger lines above
        else if (base === 'D') {
          ledgerLines.push(staffLines[4] - lineSpacing);
          ledgerLines.push(staffLines[4] - lineSpacing * 2);
        }
        // E6 needs two ledger lines above
        else if (base === 'E') {
          ledgerLines.push(staffLines[4] - lineSpacing);
          ledgerLines.push(staffLines[4] - lineSpacing * 2);
        }
        // F6 needs two ledger lines above
        else if (base === 'F') {
          ledgerLines.push(staffLines[4] - lineSpacing);
          ledgerLines.push(staffLines[4] - lineSpacing * 2);
        }
        // G6 needs three ledger lines above
        else if (base === 'G') {
          ledgerLines.push(staffLines[4] - lineSpacing);
          ledgerLines.push(staffLines[4] - lineSpacing * 2);
          ledgerLines.push(staffLines[4] - lineSpacing * 3);
        }
        // A6 needs three ledger lines above
        else if (base === 'A') {
          ledgerLines.push(staffLines[4] - lineSpacing);
          ledgerLines.push(staffLines[4] - lineSpacing * 2);
          ledgerLines.push(staffLines[4] - lineSpacing * 3);
        }
        // B6 needs three ledger lines above
        else if (base === 'B') {
          ledgerLines.push(staffLines[4] - lineSpacing);
          ledgerLines.push(staffLines[4] - lineSpacing * 2);
          ledgerLines.push(staffLines[4] - lineSpacing * 3);
        }
      }
    }

    return ledgerLines;
  };
