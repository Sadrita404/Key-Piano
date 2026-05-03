// src/components/SampleSongs.tsx

import React from 'react';
import { Play } from 'lucide-react';
import { sampleSongs } from '../data/sampleSongs';

interface SampleSongsProps {
  onPlaySong: (songName: string) => void;
  currentSong: string;
  setCurrentSong: (songName: string) => void;
}

export const SampleSongs: React.FC<SampleSongsProps> = ({
  onPlaySong,
  currentSong,
}) => {
  const handleSelectSong = (songName: string) => {
    onPlaySong(songName);
  };

  // Retro Style Constants to match the main UI
  const retroBtnBase = "border-2 border-slate-900 transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none font-bold uppercase tracking-wider";
  
  return (
    <div className="bg-slate-900 border-2 border-slate-800 rounded-none p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <h3 className="text-xl font-black text-white mb-6 text-center uppercase tracking-tighter italic border-b-2 border-slate-700 pb-2">
        TRACK_SELECTION_INDEX
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.keys(sampleSongs).map(songName => (
          <button
            key={songName}
            onClick={() => handleSelectSong(songName)}
            className={`
              ${retroBtnBase}
              p-4 rounded-none flex items-center gap-3 text-sm
              ${currentSong === songName
                ? 'bg-purple-600 text-white shadow-none translate-x-[2px] translate-y-[2px]'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }
            `}
          >
            <div className={`p-1 ${currentSong === songName ? 'bg-white text-purple-600' : 'bg-slate-900 text-purple-400'} border border-current`}>
                <Play className="w-4 h-4 fill-current" />
            </div>
            <span className="capitalize">{songName.replace(/([A-Z])/g, ' $1').trim()}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 text-center text-slate-500 font-black text-[10px] uppercase tracking-[0.2em]">
        SYSTEM: SELECT_TRACK // ENGAGE_PRACTICE_MODE
      </div>
    </div>
  );
};