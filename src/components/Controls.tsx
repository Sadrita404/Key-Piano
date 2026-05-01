import React from 'react' ;
import { Volume2 , VolumeX } from 'lucide-react';

interface ControlsProps {
    octave: number;
    setOctave: (octave: number) => void ;
    volume: number;
    setVolume: (volume: number) => void ;
}

export const Controls: React.FC<> = ({ octave , setOctave, volume , setVolume }) => {
    return (
        <div claseName="bg-gradient-to-r from-slate-800 to slate-700 rounded-xl p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Octave Control */}
            </div>
        </div>
    )
}