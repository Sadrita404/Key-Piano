import React, { useMemo, useEffect } from 'react';
import { X } from 'lucide-react';
import { normalizeNote } from '../utils/musicUtils';

interface KeyboardHintProps {
  targetNote: string;
  onClose: () => void;
}

const pianoKeyLayout = [
  // White Keys
  { note: 'C', computerKey: 'a', type: 'white' },
  { note: 'D', computerKey: 's', type: 'white' },
  { note: 'E', computerKey: 'd', type: 'white' },
  { note: 'F', computerKey: 'f', type: 'white' },
  { note: 'G', computerKey: 'g', type: 'white' },
  { note: 'A', computerKey: 'h', type: 'white' },
  { note: 'B', computerKey: 'j', type: 'white' },
  // Black Keys (with corresponding flat notes)
  { note: 'C#', flatNote: 'Db', computerKey: 'w', type: 'black', position: 0.7 },
  { note: 'D#', flatNote: 'Eb', computerKey: 'e', type: 'black', position: 1.7 },
  { note: 'F#', flatNote: 'Gb', computerKey: 't', type: 'black', position: 3.7 },
  { note: 'G#', flatNote: 'Ab', computerKey: 'y', type: 'black', position: 4.7 },
  { note: 'A#', flatNote: 'Bb', computerKey: 'u', type: 'black', position: 5.7 },
];
