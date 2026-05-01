import { useState, useEffect, useRef, useCallback } from 'react';
import { Piano } from './components/Piano';
import { AudioEngine } from './utils/AudioEngine';
import { KeyboardSettings } from './components/KeyboardSettings';
import { MusicalScore } from './components/MusicalScore';
import { noteMapping as defaultNoteMapping } from './utils/noteMapping';
import { sampleSongs } from './data/sampleSongs';
import { Volume2, Music, Clock, Play, Pause, Eye, EyeOff } from 'lucide-react';
import { normalizeNote } from './utils/musicUtils';

interface KeyboardMapping {
  [key: string]: { note: string; octave: number };
}

function App() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [octave, setOctave] = useState(4);
  const [volume, setVolume] = useState(0.7);
  const [currentSong, setCurrentSong] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [isMetronomeOn, setIsMetronomeOn] = useState(false);
  const [metronomeBPM, setMetronomeBPM] = useState(120);
  const [showMobileControls, setShowMobileControls] = useState(false);

  const [keyboardMapping, setKeyboardMapping] = useState<KeyboardMapping>(() => {

     // Initialize with default mapping
    const mapping: KeyboardMapping = {};
    Object.entries(defaultNoteMapping).forEach(([key, note]) => {
      const qwertyKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
      const asdfKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
      const zxcvKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','];

      let baseOctave = 3;
      if (asdfKeys.includes(key)) baseOctave = 4;
      if (zxcvKeys.includes(key)) baseOctave = 5;

      // Handle octave completion notes
      const isOctaveCompletion = ['i', 'k', ','].includes(key);
      const finalOctave = isOctaveCompletion ? baseOctave + 1 : baseOctave;
      mapping[key] = { note, octave: finalOctave };
    });
    return mapping;
  });

  const audioEngineRef = useRef<AudioEngine | null>(null);
  const pressedKeys = useRef<Set<string>>(new Set());
  const activeKeyToNoteMap = useRef<Map<string, string>>(new Map());
  const songTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    audioEngineRef.current = new AudioEngine();
    return () => { audioEngineRef.current?.dispose(); };
  }, []);

  // Metronome effect
  useEffect(() => {
    if (!audioEngineRef.current) return;

    if (isMetronomeOn) {
      audioEngineRef.current.startMetronome(metronomeBPM);
    } else {
      audioEngineRef.current.stopMetronome();
    }

    return () => {
      audioEngineRef.current?.stopMetronome();
    };
  }, [isMetronomeOn, metronomeBPM]);

  const stopNote = useCallback((rawNote: string) => {
    if (!audioEngineRef.current) return;
    const note = normalizeNote(rawNote);

    audioEngineRef.current.stopNote(note);
    setActiveNotes(prev => {
      const newSet = new Set(prev);
      newSet.delete(note);
      return newSet;
    });
  }, []);


  // Automatically skip 'rest' notes in practice mode
  useEffect(() => {
    // We only run this logic in practice mode with a valid song
    if (isPracticeMode && currentSong && sampleSongs[currentSong]) {
      const song = sampleSongs[currentSong];

      // Ensure we're not at the end of the song
      if (currentNoteIndex < song.notes.length) {
        const currentNote = song.notes[currentNoteIndex];

        // If the current note is a rest, schedule a skip
        if (currentNote === 'rest') {
          const beatDuration = song.durations[currentNoteIndex];
          const restDurationMs = beatDuration * (60 / metronomeBPM) * 1000;
          const timer = setTimeout(() => {
            setCurrentNoteIndex(prev => prev + 1);
          }, restDurationMs);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [currentNoteIndex, isPracticeMode, currentSong, metronomeBPM]);

  const playNote = useCallback((rawNote: string, duration?: number) => {
    if (!audioEngineRef.current) return;
    const note = normalizeNote(rawNote);
    