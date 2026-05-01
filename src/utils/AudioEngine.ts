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