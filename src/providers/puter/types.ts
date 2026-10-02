export interface PuterVoice {
  id?: string;
  name: string;
  provider?: string;
  language?: string;
  gender?: string;
  supported_models?: string[];
}

// Global Puter.js type definitions
declare global {
  interface Window {
    puter?: {
      ai: {
        chat: (prompt: string | any[], options?: any) => Promise<any>;
        txt2vid: (prompt: string, options?: any) => Promise<HTMLVideoElement | any>;
        txt2img: (prompt: string, options?: any) => Promise<HTMLImageElement | any>;
        txt2speech: {
          (text: string, options?: any): Promise<HTMLAudioElement | any>;
          listVoices?: (options?: { provider?: string }) => Promise<PuterVoice[] | any>;
        };
      };
      auth?: {
        isSignedIn: () => boolean;
        getUser: () => Promise<any>;
      };
    };
  }
}

export interface PuterGenOptions {
  duration?: number;
  aspectRatio?: string;
  style?: string;
  model?: string;
  image?: string;
}
