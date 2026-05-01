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

export const KeyboardSettings: React.FC<KeyboardSettingsProps> = ({
  mapping,
  onMappingChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempMapping, setTempMapping] = useState<KeyboardMapping>(mapping);

  const updateRowOctave = (rowIndex: number, octave: number) => {
    const newMapping = { ...tempMapping };
    const row = defaultRows[rowIndex];

    row.keys.forEach((key, noteIndex) => {
      const finalOctave = noteIndex === 7 ? octave + 1 : octave; // Last note is next octave
      newMapping[key] = { note: notes[noteIndex], octave: finalOctave };
    });

    setTempMapping(newMapping);
  };

  const saveMapping = () => {
    onMappingChange(tempMapping);
    setIsOpen(false);
  };

  const resetToDefault = () => {
    const defaultMapping: KeyboardMapping = {};