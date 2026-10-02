export interface VideoGenOptions {
  durationSeconds?: number;
  aspectRatio?: string;
  style?: string;
  model?: string;
  image?: string;
  generate_audio?: boolean;
}

export interface VideoGenResult {
  mediaUrl: string;
  thumbnailUrl: string;
  provider: string;
  videoElement?: HTMLVideoElement;
}

export interface IVideoProvider {
  name: string;
  generateSceneVideo(prompt: string, options?: VideoGenOptions): Promise<VideoGenResult>;
}
