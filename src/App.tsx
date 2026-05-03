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
    const mapping: KeyboardMapping = {};
    Object.entries(defaultNoteMapping).forEach(([key, note]) => {
      const qwertyKeys = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'];
      const asdfKeys = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'];
      const zxcvKeys = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','];

      let baseOctave = 3;
      if (asdfKeys.includes(key)) baseOctave = 4;
      if (zxcvKeys.includes(key)) baseOctave = 5;

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

  useEffect(() => {
    if (isPracticeMode && currentSong && sampleSongs[currentSong]) {
      const song = sampleSongs[currentSong];
      if (currentNoteIndex < song.notes.length) {
        const currentNote = song.notes[currentNoteIndex];
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

    if (duration) {
      if (!isMuted) {
        audioEngineRef.current.playNote(note, volume, duration);
      }
      setActiveNotes(prev => new Set(prev).add(note));
      return; 
    }

    if (isPracticeMode && currentSong && sampleSongs[currentSong]) {
      const song = sampleSongs[currentSong];
      if (song.notes[currentNoteIndex] === 'rest') return;
      const expectedNote = normalizeNote(song.notes[currentNoteIndex]);

      if (note === expectedNote) {
        const beatDuration = song.durations[currentNoteIndex];
        const noteDurationMs = beatDuration * (60 / metronomeBPM) * 1000;
        audioEngineRef.current.playNote(note, volume, noteDurationMs);
        setActiveNotes(prev => new Set(prev).add(note));
        const releaseBuffer = 50;
        setTimeout(() => stopNote(note), noteDurationMs - releaseBuffer);
        setCurrentNoteIndex(prev => prev + 1);
        if (currentNoteIndex + 1 >= song.notes.length) {
          setIsPracticeMode(false);
        }
        return;
      }
    }

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
      event.preventDefault();
      pressedKeys.current.add(key);
      let noteToPlay: string;
      if (event.shiftKey && !['E', 'B'].includes(mapping.note)) {
        noteToPlay = `${mapping.note}#${mapping.octave}`;
      } else if (event.altKey && !['C', 'F'].includes(mapping.note)) {
        noteToPlay = `${mapping.note}b${mapping.octave}`;
      } else {
        noteToPlay = `${mapping.note}${mapping.octave}`;
      }
      playNote(noteToPlay);
      activeKeyToNoteMap.current.set(key, noteToPlay);
    }
  }, [playNote, keyboardMapping]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = event.key.toLowerCase();
    pressedKeys.current.delete(key);
    const noteToStop = activeKeyToNoteMap.current.get(key);
    if (noteToStop) {
      stopNote(noteToStop);
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
      const previousNote = noteIndex > 0 ? song.notes[noteIndex - 1] : null;
      const isRepeatedNote = note === previousNote && note !== 'rest';

      if (note !== 'rest' && !isMuted && !isPracticeMode) {
        if (isRepeatedNote) {
          const articulationGap = Math.min(50, duration * 0.1);
          const actualNoteDuration = duration - articulationGap;
          stopNote(note);
          setTimeout(() => {
            playNote(note, actualNoteDuration);
            setTimeout(() => stopNote(note), actualNoteDuration);
          }, articulationGap);
        } else {
          playNote(note, duration);
          setTimeout(() => stopNote(note), duration);
        }
      }
      noteIndex++;
      songTimeoutRef.current = window.setTimeout(playNextNote, duration);
    };
    playNextNote();
  }, [playNote, stopNote, isMuted, isPracticeMode, metronomeBPM]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      if (songTimeoutRef.current) clearTimeout(songTimeoutRef.current);
      setIsPlaying(false);
      setIsPracticeMode(false);
      setCurrentNoteIndex(0);
    } else if (currentSong) {
      setIsPracticeMode(false);
      playSong(sampleSongs[currentSong]);
    }
  };

  const handleToggleMute = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    if (newMutedState && currentSong) {
      setIsPracticeMode(true);
      setIsPlaying(false);
      setCurrentNoteIndex(0);
      if (songTimeoutRef.current) clearTimeout(songTimeoutRef.current);
    } else {
      setIsPracticeMode(false);
    }
  };

  const handleSongSelect = (songName: string) => {
    if (songTimeoutRef.current) clearTimeout(songTimeoutRef.current);
    setIsPlaying(false);
    setCurrentNoteIndex(0);
    setIsPracticeMode(false);
    setCurrentSong(songName);
  };

  // Retro CSS Helper Classes (Imagine these in your Tailwind config or global CSS)
  const retroBtnBase = "border-2 border-slate-800 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wider";
  const retroCardBase = "bg-white border-2 border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]";

  return (
    <div className="min-h-screen bg-[#F3E8FF] text-slate-800">
      <div className="container mx-auto px-2 py-2 flex flex-col min-h-screen">
        {/* Header */}
        <div className="text-center mb-2">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Music className="w-6 h-6 text-purple-700" />
            <h1 className="text-2xl font-black italic tracking-tighter text-slate-900">KEY-PIANO</h1>
          </div>
          <p className="text-xs text-purple-900 font-bold opacity-80"></p>
        </div>

        {/* Mobile Controls Toggle */}
        <div className="lg:hidden mb-2">
          <button
            onClick={() => setShowMobileControls(!showMobileControls)}
            className={`${retroBtnBase} w-full p-2 bg-purple-200 hover:bg-purple-300 text-purple-900 rounded-none flex items-center justify-center gap-2 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]`}
          >
            {showMobileControls ? <><EyeOff className="w-4 h-4" /> HIDE</> : <><Eye className="w-4 h-4" /> MENU</>}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col lg:grid lg:grid-cols-3 gap-4 min-h-0">
          {/* Left Column */}
          <div className="hidden lg:flex flex-col space-y-4">
            {/* Desktop Controls */}
            <div className={`${retroCardBase} rounded-none p-3`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 mb-1">VOLUME </label>
                  <input
                    type="range" min="0" max="1" step="0.1" value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-black text-slate-500">TEMPO BPM</label>
                    <button
                      onClick={() => setIsMetronomeOn(!isMetronomeOn)}
                      className={`${retroBtnBase} px-2 py-0.5 text-[10px] rounded-none ${isMetronomeOn ? 'bg-green-400 text-slate-900' : 'bg-slate-200'}`}
                    >
                      {isMetronomeOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                  <input
                    type="range" min="40" max="240" step="5" value={metronomeBPM}
                    onChange={(e) => setMetronomeBPM(parseInt(e.target.value))}
                    className="w-full accent-purple-600"
                    disabled={!isMetronomeOn}
                  />
                </div>
              </div>
            </div>

            {/* Sample Songs */}
            <div className={`${retroCardBase} rounded-none p-4 flex-1 min-h-0 flex flex-col`}>
              <h3 className="text-xs font-black mb-3 border-b-2 border-slate-800 pb-1">LIBRARY_INDEX</h3>
              <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                {Object.keys(sampleSongs).map(songName => (
                  <button
                    key={songName}
                    onClick={() => handleSongSelect(songName)}
                    className={`${retroBtnBase} w-full p-2 text-xs text-left rounded-none ${currentSong === songName ? 'bg-purple-600 text-white shadow-none translate-x-[2px] translate-y-[2px]' : 'bg-white hover:bg-purple-50 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]'}`}
                  >
                    {songName.replace(/([A-Z])/g, ' $1').trim()}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-auto">
              <KeyboardSettings mapping={keyboardMapping} onMappingChange={setKeyboardMapping} />
            </div>
          </div>

          {/* Mobile Overlay */}
          {showMobileControls && (
            <div className="lg:hidden space-y-3 mb-2 animate-in fade-in slide-in-from-top-4">
              <div className={`${retroCardBase} p-3`}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-500 mb-1">VOLUME</label>
                    <input
                      type="range" min="0" max="1" step="0.1" value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full accent-purple-600"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => setIsMetronomeOn(!isMetronomeOn)}
                      className={`${retroBtnBase} w-full p-1 text-[10px] ${isMetronomeOn ? 'bg-green-400' : 'bg-slate-200'}`}
                    >
                      METRONOME: {isMetronomeOn ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              <div className={`${retroCardBase} p-3`}>
                <h3 className="text-[10px] font-black mb-2 text-center uppercase tracking-widest">Select Track</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.keys(sampleSongs).map(songName => (
                    <button
                      key={songName}
                      onClick={() => handleSongSelect(songName)}
                      className={`${retroBtnBase} p-2 text-[10px] ${currentSong === songName ? 'bg-purple-600 text-white shadow-none' : 'bg-white shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]'}`}
                    >
                      {songName.substring(0, 12)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Musical Score */}
          <div className="lg:col-span-2 flex-1 min-h-0">
            <div className="h-full border-2 border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
              <MusicalScore
                currentSong={currentSong}
                isPlaying={isPlaying}
                isMuted={isMuted}
                isPracticeMode={isPracticeMode}
                currentNoteIndex={currentNoteIndex}
                onTogglePlay={handleTogglePlay}
                onToggleMute={handleToggleMute}
                onShowHint={() => setShowHint(true)}
                songData={currentSong ? {
                  ...sampleSongs[currentSong],
                  title: currentSong.replace(/([A-Z])/g, ' $1').trim()
                } : undefined}
                keyboardMapping={keyboardMapping}
                showHint={showHint}
                onCloseHint={() => setShowHint(false)}
              />
            </div>
          </div>
        </div>

        {/* Piano Section */}
        <div className="mt-4 p-2 bg-slate-100 border-2 border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
          <Piano
            activeNotes={activeNotes}
            onNotePlay={playNote}
            onNoteStop={stopNote}
          />
        </div>

        {/* Mobile Mapping */}
        <div className="lg:hidden mt-4">
          <KeyboardSettings mapping={keyboardMapping} onMappingChange={setKeyboardMapping} />
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-slate-500">
          <p className="text-[9px] font-black uppercase tracking-[0.2em] border-t border-slate-300 pt-2">
           |  DESIGNED BY SADRITA NEOGI ( HACK CLUB ) | 
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;