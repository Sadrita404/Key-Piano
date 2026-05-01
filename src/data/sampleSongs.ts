// src/data/sampleSongs.ts

export const sampleSongs: { [key: string]: { notes: string[]; durations: number[] } } = {
  "Happy Birthday": {
    notes: ['C4', 'C4', 'D4', 'C4', 'F4', 'E4', 'rest', 'C4', 'C4', 'D4', 'C4', 'G4', 'F4', 'rest',
      'C4', 'C4', 'C5', 'A4', 'F4', 'E4', 'D4', 'rest', 'Bb4', 'Bb4', 'A4', 'F4', 'G4', 'F4'],
    durations: [0.5, 0.5, 1, 1, 1, 2, 1, 0.5, 0.5, 1, 1, 1, 2, 1,
      0.5, 0.5, 1, 1, 1, 1, 2, 1, 0.5, 0.5, 1, 1, 1, 2]
  },