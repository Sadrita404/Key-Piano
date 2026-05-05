// src/utils/musicUtils.ts

const ENHARMONIC_MAP: { [key: string]: string } = {
  'Bb': 'A#',
  'Eb': 'D#',
  'Ab': 'G#',
  'Db': 'C#',
  'Gb': 'F#',
};

/**
 * Normalizes a musical note to a standard format for comparison.
 * - Extracts the note name and octave.
 * - Converts flats to their sharp equivalents.
 * @param note The note string to normalize (e.g., "Bb4").
 * @returns The normalized note string (e.g., "A#4").
 */

  // Convert flat to its sharp equivalent if it exists in our map
  if (ENHARMONIC_MAP[noteName]) {
    noteName = ENHARMONIC_MAP[noteName];
  }

  return `${noteName}${octave}`;
};