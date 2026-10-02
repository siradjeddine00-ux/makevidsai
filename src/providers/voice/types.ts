import { PuterVoice } from '../puter/types';

export interface VoiceGenOptions {
  voice?: string;
  language?: string;
  provider?: string;
}

export interface VoiceGenResult {
  audioUrl?: string;
  audioElement?: HTMLAudioElement;
}

export interface IVoiceProvider {
  name: string;
  generateVoice(text: string, options?: VoiceGenOptions): Promise<VoiceGenResult>;
  listVoices(): Promise<PuterVoice[]>;
}
