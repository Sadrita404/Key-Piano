/ src/utils/AudioEngine.ts

export class AudioEngine {
  private audioContext: AudioContext;
  private oscillators: Map<string, OscillatorNode>;
  private gainNodes: Map<string, GainNode>;
  private metronomeIntervalId: number | null = null;
  private metronomeGainNode: GainNode;
  private masterGainNode: GainNode;
  private reverbNode: ConvolverNode | null = null;
