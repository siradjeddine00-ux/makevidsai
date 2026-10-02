export type VideoAspectRatio = '16:9' | '9:16' | '1:1';
export type VideoDuration = '15s' | '30s' | '1m' | '3m' | '5m' | '10m' | '15m' | '20m' | '30m';
export type VideoGenerationMode = 'fast' | 'high_quality';
export type VideoStyle = 
  | 'cinematic' 
  | 'realistic' 
  | 'anime' 
  | '3d' 
  | 'cartoon' 
  | 'documentary' 
  | 'fantasy' 
  | 'sci-fi' 
  | 'product_commercial' 
  | 'custom';

export type VoiceOption = 'none' | 'male' | 'female' | 'ai_voice' | 'upload_voice';
export type MusicOption = 'none' | 'ai_music' | 'upload_music';
export type SubtitleOption = 'off' | 'auto';
export type CreationMode = 'text' | 'image' | 'script' | 'story' | 'ad' | 'template';

export interface CharacterReference {
  id: string;
  name: string;
  ageAppearance: string;
  gender: string;
  faceDescription: string;
  hairDescription: string;
  clothingDescription: string;
  bodyProportions: string;
  accessories?: string;
  referenceImageUrl?: string;
}

export interface VideoScene {
  id: string;
  chapterId?: string;
  sceneNumber: number;
  title: string;
  durationSeconds: number;
  visualPrompt: string;
  cameraMovement: string;
  lighting: string;
  narrationText: string;
  subtitleText: string;
  characterIds?: string[];
  status: 'queued' | 'generating' | 'completed' | 'failed';
  retryCount: number;
  mediaUrl?: string;
  thumbnailUrl?: string;
  audioUrl?: string;
  errorMessage?: string;
}

export interface VideoChapter {
  id: string;
  chapterNumber: number;
  title: string;
  summary: string;
  sceneIds: string[];
}

export interface VideoProject {
  id: string;
  userId: string;
  title: string;
  rawPrompt: string;
  creationMode: CreationMode;
  aspectRatio: VideoAspectRatio;
  duration: VideoDuration;
  generationMode: VideoGenerationMode;
  style: VideoStyle;
  voice: VoiceOption;
  voiceLanguage: string;
  music: MusicOption;
  musicMood: string;
  subtitles: SubtitleOption;
  subtitleStyle: 'modern' | 'karaoke' | 'bold_social' | 'classic';
  creditCost: number;
  status: 'draft' | 'queued' | 'processing' | 'completed' | 'failed';
  progressPercentage: number;
  currentStepMessage: string;
  createdAt: string;
  updatedAt: string;
  creativeBrief?: {
    logline: string;
    targetAudience: string;
    visualTone: string;
    narrativePacing: string;
  };
  characters: CharacterReference[];
  chapters: VideoChapter[];
  scenes: VideoScene[];
  finalVideoUrl?: string;
  thumbnailUrl?: string;
  hasWatermark: boolean;
  isPublicShare: boolean;
  shareId?: string;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'retrying';
  progress: number;
  currentStage: 'brief' | 'script' | 'scenes' | 'voice' | 'music' | 'subtitles' | 'rendering' | 'completed';
  totalScenes: number;
  completedScenes: number;
  failedScenes: number;
  retryCount: number;
  errorMessage?: string;
  startTime: string;
  endTime?: string;
}

export type UserRole = 'user' | 'creator' | 'founder' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  credits: number;
  subscriptionPlan: 'free' | 'creator' | 'pro';
  subscriptionBilling: 'monthly' | 'yearly';
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  avatarUrl?: string;
  createdAt: string;
}

export interface CreditTransaction {
  id: string;
  userId: string;
  amount: number;
  type: 'usage' | 'subscription' | 'purchase' | 'admin_grant' | 'refund';
  description: string;
  timestamp: string;
}

export interface VideoTemplate {
  id: string;
  title: string;
  category: string;
  description: string;
  suggestedAspectRatio: VideoAspectRatio;
  suggestedDuration: VideoDuration;
  suggestedStyle: VideoStyle;
  promptPlaceholder: string;
  previewThumbnailUrl: string;
  tags: string[];
}

export interface AdminAnalytics {
  totalUsers: number;
  newUsersToday: number;
  activeSubscriptions: number;
  revenueMtd: number;
  videosGenerated: number;
  totalGenerationMinutes: number;
  creditsUsed: number;
  failedJobsCount: number;
  storageUsedGb: number;
}

export type UsdtNetwork = 'TRC20' | 'ERC20';

export type PaymentStatus = 
  | 'pending_verification' 
  | 'verified' 
  | 'failed' 
  | 'already_used' 
  | 'invalid_transaction';

export interface UsdtPaymentRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  billingCadence: 'monthly' | 'yearly';
  amountUsdt: number;
  currency: 'USDT';
  network: UsdtNetwork;
  walletAddress: string;
  txid: string;
  status: PaymentStatus;
  verificationResult?: string;
  createdAt: string;
  verifiedAt?: string;
}

export interface UsdtConfig {
  trc20Address: string;
  erc20Address: string;
}
