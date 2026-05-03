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

  // Auto-scroll to keep current note in center
  useEffect(() => {
    if (autoScroll && currentNoteRef.current && notesContainerRef.current) {
      const container = notesContainerRef.current;
      const currentNote = currentNoteRef.current;
      const containerWidth = container.clientWidth;
      const noteOffsetLeft = currentNote.offsetLeft;
      const noteWidth = currentNote.clientWidth;
      const scrollLeft = noteOffsetLeft - (containerWidth / 2) + (noteWidth / 2);

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  }, [currentNoteIndex, autoScroll]);

  // Retro Design Helpers
  const retroBtnBase = "border-2 border-slate-950 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-black uppercase tracking-tighter shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]";

  if (!songData) {
    return (
      <div className="bg-slate-900 border-2 border-slate-800 rounded-none p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-black text-white mb-3 uppercase italic tracking-widest">SONG NOT SELECTED</h3>
          <p className="text-slate-500 font-bold text-xs uppercase">Select a track to initialize score</p>
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
    return { base: note.replace(/\d+/, ""), accidental: "", octave: "" };
  };

  const getNoteDisplay = (note: string) => {
    const { base, accidental, octave } = parseNoteSymbol(note);
    if (base === 'Rest') return 'REST';
    const accidentalSymbol = accidental === '#' ? '♯' : accidental === 'b' ? '♭' : '';
    return (
      <>
        <span>{base}{accidentalSymbol}</span>
        <sub className="opacity-60">{octave}</sub>
      </>
    );
  };

  const getNoteDuration = (duration: number) => {
    if (duration >= 2) return '𝅝'; 
    if (duration >= 1) return '𝅗𝅥'; 
    if (duration >= 0.5) return '𝅘𝅥'; 
    if (duration >= 0.25) return '𝅘𝅥𝅮';
    return '𝅘𝅥𝅯';
  };

  const getRestDuration = (duration: number) => {
    if (duration >= 2) return '𝄻';
    if (duration >= 1) return '𝄼';
    if (duration >= 0.5) return '𝄽';
    return '𝄾';
  };

  const getStaffPosition = (note: string): { top: number } => {
    const { base, accidental, octave } = parseNoteSymbol(note);
    if (note === 'rest') return { top: 44 };
    const middleCPosition = 70;
    const lineSpacing = 12;
    const notePositions: Record<string, number> = {
      'C': 0, 'C#': 0, 'Db': 0, 'D': -1, 'D#': -1, 'Eb': -1,
      'E': -2, 'F': -3, 'F#': -3, 'Gb': -3, 'G': -4, 'G#': -4,
      'Ab': -4, 'A': -5, 'A#': -5, 'Bb': -5, 'B': -6
    };
    const octaveNum = parseInt(octave);
    const octaveOffset = (4 - octaveNum) * 7;
    const noteOffset = notePositions[base + (accidental || '')] || 0;
    const totalOffset = octaveOffset + noteOffset;
    return { top: middleCPosition + (totalOffset * (lineSpacing / 2)) };
  };

  const getLedgerLines = (note: string, noteTop: number): number[] => {
    if (note === 'rest') return [];
    const staffLines = [68, 56, 44, 32, 20];
    const lineSpacing = 12;
    const ledgerLines: number[] = [];
    if (noteTop > staffLines[0]) {
        ledgerLines.push(staffLines[0] + lineSpacing);
    } else if (noteTop < staffLines[4]) {
        ledgerLines.push(staffLines[4] - lineSpacing);
    }
    return ledgerLines;
  };

  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-none p-4 h-full flex flex-col shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="text-center mb-4">
        {/* Retro Controls */}
        <div className="flex justify-center gap-3 mb-4">
          <button
            onClick={onTogglePlay}
            className={`
              ${retroBtnBase} flex items-center gap-2 px-4 py-2 text-xs
              ${isPlaying ? 'bg-red-500 text-white' : 'bg-green-500 text-slate-950'}
            `}
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'STOP ' : 'PLAY'}
          </button>

          <button
            onClick={onToggleMute}
            className={`
              ${retroBtnBase} flex items-center gap-2 px-4 py-2 text-xs
              ${isMuted ? 'bg-amber-500 text-slate-950' : 'bg-sky-500 text-slate-950'}
            `}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isMuted ? ' PRACTICE' : 'LISTEN'}
          </button>

          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`
              ${retroBtnBase} flex items-center gap-2 px-3 py-2 text-xs
              ${autoScroll ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'}
            `}
          >
            <Navigation className={`w-4 h-4 ${autoScroll ? 'fill-current' : ''}`} />
            AUTO SCROLL
          </button>
        </div>

        {isMuted && (
          <div className="bg-slate-800 border-l-4 border-amber-500 p-2 mb-3 text-left">
            <p className="text-amber-400 font-bold text-[10px] uppercase tracking-wider">
              {isPracticeMode
                ? `>> WAITING_FOR_INPUT: "${songData.notes[currentNoteIndex]}"`
                : '>> SYSTEM_IDLE: TOGGLE PRACTICE TO BEGIN'}
            </p>
          </div>
        )}
      </div>

      {/* Musical Staff - Darker Retro Version */}
      <div
        ref={notesContainerRef}
        className="bg-slate-950 border-2 border-slate-800 p-4 overflow-x-auto flex-1 scroll-smooth"
      >
        <div className="min-w-max relative" style={{ height: '120px' }}>
          <svg width="100%" height="120" className="absolute top-0 left-0" style={{ zIndex: 1 }}>
            {[20, 32, 44, 56, 68].map((y, index) => (
              <line key={index} x1="0" y1={y} x2="100%" y2={y} stroke="#1e293b" strokeWidth="2" />
            ))}
            <text x="10" y="55" fontSize="48" fill="#334155" fontFamily="serif">𝄞</text>
            <text x="60" y="35" fontSize="20" fill="#334155" fontWeight="black">4</text>
            <text x="60" y="55" fontSize="20" fill="#334155" fontWeight="black">4</text>
          </svg>

          <div className="flex gap-6 ml-20 relative" style={{ zIndex: 2 }}>
            {songData.notes.map((note, index) => {
              const isCurrentNote = index === currentNoteIndex;
              const isPastNote = index < currentNoteIndex;
              const isRest = note === 'rest';
              const staffPos = getStaffPosition(note);
              const ledgerLines = getLedgerLines(note, staffPos.top);

              return (
                <div
                  ref={isCurrentNote ? currentNoteRef : null}
                  key={index}
                  className={`relative flex flex-col items-center min-w-[40px]`}
                >
                  {ledgerLines.map((lineY, li) => (
                    <div key={li} className="absolute bg-slate-700 w-6 h-[2px]" style={{ top: `${lineY}px` }} />
                  ))}

                  <div
                    className="absolute"
                    style={{ top: `${staffPos.top}px`, transform: 'translateY(-50%)' }}
                  >
                    <span
                      className={`text-4xl font-bold transition-colors duration-150 
                        ${isCurrentNote ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : isPastNote ? 'text-slate-600' : 'text-slate-300'}`}
                    >
                      {isRest ? getRestDuration(songData.durations[index]) : getNoteDuration(songData.durations[index])}
                    </span>
                  </div>

                  <div
                    className={`text-[9px] font-black px-1 mt-[100px] border ${isCurrentNote ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                  >
                    {getNoteDisplay(note)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Progress Bar - Retro Style */}
      <div className="mt-4">
        <div className="flex justify-between text-[10px] font-black text-slate-500 mb-1 uppercase tracking-widest">
          <span>BUFF_STATUS</span>
          <span>{currentNoteIndex} / {songData.notes.length}</span>
        </div>
        <div className="w-full bg-slate-800 border border-slate-700 h-3 p-[2px]">
          <div
            className={`h-full transition-all duration-300 ${isPracticeMode ? 'bg-amber-500' : 'bg-purple-600'}`}
            style={{ width: `${(currentNoteIndex / songData.notes.length) * 100}%` }}
          />
        </div>
      </div>

      {showHint && isPracticeMode && songData && (
        <KeyboardHint
          targetNote={songData.notes[currentNoteIndex]}
          onClose={onCloseHint}
        />
      )}
    </div>
  );
};