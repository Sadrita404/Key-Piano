import React, { useState } from 'react';
import { Settings, Save, RotateCcw } from 'lucide-react';

interface KeyboardMapping {
  [key: string]: { note: string; octave: number };
}

interface KeyboardSettingsProps {
  mapping: KeyboardMapping;
  onMappingChange: (mapping: KeyboardMapping) => void;
}

const defaultRows = [
  { keys: ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i'], label: 'QWERTY Row' },
  { keys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k'], label: 'ASDF Row' },
  { keys: ['z', 'x', 'c', 'v', 'b', 'n', 'm', ','], label: 'ZXCV Row' }
];

const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'];
const solfege = ['do', 're', 'mi', 'fa', 'so', 'la', 'ti', 'do'];
