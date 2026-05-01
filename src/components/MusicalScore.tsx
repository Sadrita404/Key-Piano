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
