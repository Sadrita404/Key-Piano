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
    // If the duration is provided, it's a song note from autoplay.
    if (duration) {
      if (!isMuted) {
        audioEngineRef.current.playNote(note, volume, duration);
      }
      setActiveNotes(prev => new Set(prev).add(note));
      return; // End here for autoplay notes
    }

    // Check if we are in practice mode and the note is correct
    if (isPracticeMode && currentSong && sampleSongs[currentSong]) {
      const song = sampleSongs[currentSong];
      // Make sure we're not stuck on a rest (though the useEffect should handle this)
      if (song.notes[currentNoteIndex] === 'rest') return;

      const expectedNote = normalizeNote(song.notes[currentNoteIndex]);

      if (note === expectedNote) {
        // Calculate the note's duration based on the song's tempo
        const beatDuration = song.durations[currentNoteIndex];
        const noteDurationMs = beatDuration * (60 / metronomeBPM) * 1000;

        // Play the audio and visuals for the correct duration
        audioEngineRef.current.playNote(note, volume, noteDurationMs);
        setActiveNotes(prev => new Set(prev).add(note));

        const releaseBuffer = 50;
        setTimeout(() => {
          stopNote(note);
        }, noteDurationMs - releaseBuffer);

        // Advance to the next note in the song
        setCurrentNoteIndex(prev => prev + 1);

        if (currentNoteIndex + 1 >= song.notes.length) {
          setIsPracticeMode(false);
        }
        return; // Handled, so we exit
      }
    }

    // Default handling for FREE PLAY or an INCORRECT NOTE in practice mode
    audioEngineRef.current.playNote(note, volume);

    setActiveNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(note)) {
        newSet.delete(note);
        return newSet;
      }
      return prev;
    });

    setTimeout(() => {
      setActiveNotes(prev => new Set(prev).add(note));
    }, 0);

  }, [volume, isMuted, isPracticeMode, currentSong, currentNoteIndex, metronomeBPM, stopNote]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    if (pressedKeys.current.has(key) || event.repeat) return;

    const mapping = keyboardMapping[key];
    if (mapping) {
      // Prevent browser shortcuts (e.g., Alt+F opening a menu)
      event.preventDefault();
      pressedKeys.current.add(key);

      let noteToPlay: string;

      // Determine the note based on modifiers (Shift > Alt > Natural)
      if (event.shiftKey && !['E', 'B'].includes(mapping.note)) {
        noteToPlay = `${mapping.note}#${mapping.octave}`;
      } else if (event.altKey && !['C', 'F'].includes(mapping.note)) {
        noteToPlay = `${mapping.note}b${mapping.octave}`;
      } else {
        noteToPlay = `${mapping.note}${mapping.octave}`;
      }
       // Play the note and store the mapping
      playNote(noteToPlay);
      activeKeyToNoteMap.current.set(key, noteToPlay);
    }
  }, [octave, playNote, keyboardMapping]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    pressedKeys.current.delete(key);

    // Look up which note was actually played by this key
    const noteToStop = activeKeyToNoteMap.current.get(key);

    if (noteToStop) {
      stopNote(noteToStop);
      // Clean up the mapping
      activeKeyToNoteMap.current.delete(key);
    }
  }, [stopNote]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const playSong = useCallback((song: { notes: string[]; durations: number[] }) => {
    setIsPlaying(true);
    setCurrentNoteIndex(0);

    // Use metronome BPM for song tempo (quarter note = 1 beat)
    const beatDurationMs = (60 / metronomeBPM) * 1000; 

    let noteIndex = 0;

    const playNextNote = () => {
      if (noteIndex >= song.notes.length) {
        setCurrentSong('');
        setIsPlaying(false);
        setCurrentNoteIndex(0);
        return;
      }

      setCurrentNoteIndex(noteIndex);
      const note = song.notes[noteIndex];
      const duration = song.durations[noteIndex] * beatDurationMs;
      