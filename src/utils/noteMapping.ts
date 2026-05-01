// src/utils/noteMapping.ts

export const noteMapping: { [key: string]: string } = {
  // First row (QWERTYUI) - Base octave (do re mi fa so la ti do)
  'q': 'C',
  'w': 'D',
  'e': 'E',
  'r': 'F',
  't': 'G',
  'y': 'A',
  'u': 'B',
  'i': 'C',

   // Second row (ASDFGHJ) - Next octave (do re mi fa so la ti do)
  'a': 'C',
  's': 'D',
  'd': 'E',
  'f': 'F',
  'g': 'G',
  'h': 'A',
  'j': 'B',
  'k': 'C',
  
  // Third row (ZXCVBNM) - Next octave (do re mi fa so la ti do)
  'z': 'C',
  'x': 'D',
  'c': 'E',
  'v': 'F',
  'b': 'G',
  'n': 'A',
  'm': 'B',
  ',': 'C'
};
