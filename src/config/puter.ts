/**
 * Central configuration for Puter.js AI Video and Audio Engine.
 * All model parameters and options are managed from here.
 */

export interface PuterConfig {
  defaultVideoModel: string;
  defaultSeconds: number;
  generateAudio: boolean;
  maxTtsCharsPerChunk: number;
  availableModels: { id: string; name: string; description: string }[];
}

export const puterConfig: PuterConfig = {
  // Puter.js default model for txt2vid (defaults to Google Veo 3.1 Lite)
  defaultVideoModel: 'google/veo-3.1-lite',
  defaultSeconds: 5,
  generateAudio: true,
  // Puter txt2speech documented single request character ceiling
  maxTtsCharsPerChunk: 2800,
  availableModels: [
    {
      id: 'google/veo-3.1-lite',
      name: 'Google Veo 3.1 Lite (Puter Default)',
      description: 'Official default model with smooth motion and synchronized audio synthesis'
    },
    {
      id: 'wan-2.1',
      name: 'Wan 2.1',
      description: 'High-definition 720p/1080p stylized video rendering engine'
    },
    {
      id: 'together',
      name: 'Together Video AI',
      description: 'Balanced visual coherence and realistic cinematic lighting'
    }
  ]
};
