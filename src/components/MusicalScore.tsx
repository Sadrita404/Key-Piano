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

  return (
    <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-4 h-full flex flex-col">
      <div className="text-center mb-4">
        {/* Controls */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={onTogglePlay}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm
              ${isPlaying
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
              }
            `}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isPlaying ? 'Stop' : 'Play'}
          </button>

          <button
            onClick={onToggleMute}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm
              ${isMuted
                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
              }
            `}
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            {isMuted ? 'Practice Mode' : 'Listen Mode'}
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`
              flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm
              ${autoScroll
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
              }
            `}
          >
            <Navigation className="w-4 h-4" />
            Auto-scroll
          </button>
        </div>

        {isMuted && (
          <div className="bg-orange-900/30 rounded-lg p-2 mb-3">
            <p className="text-orange-200 text-xs">
              {isPracticeMode
                ? `🎯 Practice Mode: Play the highlighted note "${getNoteDisplay(songData.notes[currentNoteIndex])}" to continue!`
                : '🎯 Practice Mode: Select a song and toggle to practice mode to begin interactive learning!'
              }
            </p>
          </div>
        )}

        {isPracticeMode && currentNoteIndex >= songData.notes.length && (
          <div className="bg-green-900/30 rounded-lg p-3 mb-3">
            <p className="text-green-200 font-semibold text-center">
              🎉 Congratulations! You completed "{songData.title}"!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 mx-auto block px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              Play Again
            </button>
          </div>
        )}
      </div>


      {/* Musical Staff */}
      <div
        ref={notesContainerRef}
        className="bg-white/10 rounded-lg p-4 overflow-x-auto flex-1 scroll-smooth"
      >
        <div className="min-w-max relative" style={{ height: '120px' }}>
          {/* Staff Lines Background */}
          <svg width="100%" height="120" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
            {/* Main staff lines */}
            {[20, 32, 44, 56, 68].map((y, index) => (
              <line
                key={`staff-${index}`}
                x1="0"
                y1={y}
                x2="100%"
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            ))}

            {/* Treble clef */}
            <text x="10" y="50" fontSize="48" fill="#e5e7eb" fontFamily="serif">𝄞</text>

            {/* Time signature */}
            <text x="60" y="35" fontSize="20" fill="#e5e7eb" fontWeight="bold">4</text>
            <text x="60" y="55" fontSize="20" fill="#e5e7eb" fontWeight="bold">4</text>
          </svg>

          {/* Notes */}
          <div className="flex gap-4 ml-20 relative" style={{ zIndex: 2 }}>
            {songData.notes.map((note, index) => {
              const isCurrentNote = index === currentNoteIndex;
              const isPastNote = index < currentNoteIndex;
              const isRest = note === 'rest';
              const isWaitingNote = isPracticeMode && isCurrentNote;

              const { base, accidental } = parseNoteSymbol(note);
              const accidentalSymbol = accidental === "#" ? "♯" : accidental === "b" ? "♭" : "";

              const staffPos = getStaffPosition(note);