/ src/utils/AudioEngine.ts

export class AudioEngine {
  private audioContext: AudioContext;
  private oscillators: Map<string, OscillatorNode>;
  private gainNodes: Map<string, GainNode>;
  private metronomeIntervalId: number | null = null;
  private metronomeGainNode: GainNode;
  private masterGainNode: GainNode;
  private reverbNode: ConvolverNode | null = null;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.oscillators = new Map();
    this.gainNodes = new Map();

    // Create master gain node for overall volume control
    this.masterGainNode = this.audioContext.createGain();
    this.masterGainNode.connect(this.audioContext.destination);

    // Create dedicated gain node for metronome volume control
    this.metronomeGainNode = this.audioContext.createGain();
    this.metronomeGainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    this.metronomeGainNode.connect(this.masterGainNode);

    this.initializeReverb();
  }

  private async initializeReverb(): Promise<void> {
    try {
      // Create a simple reverb impulse response
      const length = this.audioContext.sampleRate * 2; // 2 seconds
      const impulse = this.audioContext.createBuffer(2, length, this.audioContext.sampleRate);

      for (let channel = 0; channel < 2; channel++) {
        const channelData = impulse.getChannelData(channel);
        for (let i = 0; i < length; i++) {
          channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
        }
      }

      this.reverbNode = this.audioContext.createConvolver();
      this.reverbNode.buffer = impulse;
      this.reverbNode.connect(this.masterGainNode);
    } catch (error) {
      console.warn('Could not initialize reverb:', error);
    }
  }

  private getFrequency(note: string): number {
    const noteFrequencies: { [key: string]: number } = {
      'C': 261.63,
      'C#': 277.18, 'Db': 277.18,
      'D': 293.66,
      'D#': 311.13, 'Eb': 311.13,
      'E': 329.63,
      'F': 349.23,
      'F#': 369.99, 'Gb': 369.99,
      'G': 392.00,
      'G#': 415.30, 'Ab': 415.30,
      'A': 440.00,
      'A#': 466.16, 'Bb': 466.16,
      'B': 493.88
    };

    const match = note.match(/([A-G][#b]?)(\d+)/);
    if (!match) return 440;

    const [, noteName, octaveStr] = match;
    const octave = parseInt(octaveStr);
    const baseFreq = noteFrequencies[noteName] || 440;


     const octaveMultiplier = Math.pow(2, octave - 4);

    return baseFreq * octaveMultiplier;
  }

  private createPianoOscillator(frequency: number): OscillatorNode {
    const oscillator = this.audioContext.createOscillator();

    // Create a more piano-like sound using multiple harmonics
    const real = new Float32Array([0, 1, 0.5, 0.3, 0.2, 0.1, 0.05, 0.02]);
    const imag = new Float32Array(real.length);
    const customWave = this.audioContext.createPeriodicWave(real, imag);

    oscillator.setPeriodicWave(customWave);
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    return oscillator;
  }

  private playMetronomeClick(isDownbeat: boolean = false): void {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }

    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();