import { activeVideoProvider, VideoGenOptions, VideoGenResult } from '../../providers/video';
import { activeImageProvider } from '../../providers/image';
import { activeVoiceProvider, VoiceGenOptions, VoiceGenResult } from '../../providers/voice';
import { puterProvider } from '../../providers/puter';
import { PuterVoice } from '../../providers/puter/types';
import { VideoScene, VideoStyle } from '../../types';

export class AIService {
  /**
   * Generates a single video scene through the active video provider (Puter.js)
   * Resolves directly to an HTMLVideoElement and its playable src.
   */
  public async generateSceneClip(
    scene: VideoScene, 
    style: VideoStyle,
    options?: Partial<VideoGenOptions>
  ): Promise<VideoGenResult> {
    try {
      const prompt = scene.visualPrompt || scene.title;
      return await activeVideoProvider.generateSceneVideo(prompt, {
        durationSeconds: scene.durationSeconds,
        style,
        ...options
      });
    } catch (err) {
      console.error(`[AIService] Failed generating clip for Scene ${scene.sceneNumber}:`, err);
      throw err;
    }
  }

  /**
   * AI Script generation via Puter.js
   */
  public async generateScript(prompt: string): Promise<string> {
    return puterProvider.generateScript(prompt);
  }

  /**
   * AI Image generation via Puter.js
   */
  public async generateImage(prompt: string): Promise<string> {
    return activeImageProvider.generateImage(prompt);
  }

  /**
   * AI Voice generation via Puter.js
   */
  public async generateVoice(text: string, options?: VoiceGenOptions): Promise<VoiceGenResult> {
    return activeVoiceProvider.generateVoice(text, options);
  }

  /**
   * Dynamic discovery of real Puter.js voices
   */
  public async listVoices(): Promise<PuterVoice[]> {
    return activeVoiceProvider.listVoices();
  }
}

export const aiService = new AIService();
