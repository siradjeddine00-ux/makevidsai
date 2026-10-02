import { 
  UserProfile, 
  VideoProject, 
  GenerationJob, 
  CreditTransaction, 
  VideoTemplate, 
  AdminAnalytics, 
  VideoScene,
  VideoChapter,
  UsdtPaymentRecord
} from '../src/types';

// In-memory state store with mock initial records
export interface DatabaseState {
  users: Map<string, UserProfile>;
  projects: Map<string, VideoProject>;
  jobs: Map<string, GenerationJob>;
  transactions: CreditTransaction[];
  templates: VideoTemplate[];
  usdtPayments: Map<string, UsdtPaymentRecord>;
  usedTxids: Set<string>;
  plans: {
    id: string;
    name: string;
    monthlyPrice: number;
    yearlyPrice: number;
    creditsMonthly: number;
    maxDurationMinutes: number;
    hasWatermark: boolean;
    priorityProcessing: boolean;
    features: string[];
  }[];
  adminLogs: { id: string; timestamp: string; action: string; actor: string; details: string }[];
}

export const db: DatabaseState = {
  users: new Map(),
  projects: new Map(),
  jobs: new Map(),
  transactions: [],
  templates: [],
  usdtPayments: new Map(),
  usedTxids: new Set(),
  plans: [
    {
      id: 'free',
      name: 'Free',
      monthlyPrice: 0,
      yearlyPrice: 0,
      creditsMonthly: 50,
      maxDurationMinutes: 1,
      hasWatermark: true,
      priorityProcessing: false,
      features: ['50 credits / month', 'Up to 1 min videos', 'Standard generation speed', 'MakeVidsAI watermark', '720p export']
    },
    {
      id: 'creator',
      name: 'Creator',
      monthlyPrice: 29,
      yearlyPrice: 24,
      creditsMonthly: 500,
      maxDurationMinutes: 10,
      hasWatermark: false,
      priorityProcessing: false,
      features: ['500 credits / month', 'Up to 10 min videos', 'No watermark', '1080p full HD export', 'All AI styles & voices', 'Chapter editor']
    },
    {
      id: 'pro',
      name: 'Pro',
      monthlyPrice: 79,
      yearlyPrice: 65,
      creditsMonthly: 1500,
      maxDurationMinutes: 30,
      hasWatermark: false,
      priorityProcessing: true,
      features: ['1,500 credits / month', 'Up to 30 min videos', 'Priority GPU queue', 'Character consistency system', '4K ultra HD render', 'Dedicated founder support']
    }
  ],
  adminLogs: []
};

// Seed initial users
const defaultFounder: UserProfile = {
  id: 'usr_founder_01',
  email: 'founder@makevids.ai',
  name: 'Alex Rivera (Founder)',
  role: 'founder',
  credits: 5000,
  subscriptionPlan: 'pro',
  subscriptionBilling: 'yearly',
  subscriptionStatus: 'active',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  createdAt: '2026-01-15T00:00:00.000Z'
};

const defaultCreator: UserProfile = {
  id: 'usr_creator_02',
  email: 'sarah.creator@example.com',
  name: 'Sarah Chen',
  role: 'creator',
  credits: 420,
  subscriptionPlan: 'creator',
  subscriptionBilling: 'monthly',
  subscriptionStatus: 'active',
  createdAt: '2026-02-10T12:00:00.000Z'
};

const defaultFreeUser: UserProfile = {
  id: 'usr_free_03',
  email: 'newbie@example.com',
  name: 'David Miller',
  role: 'user',
  credits: 50,
  subscriptionPlan: 'free',
  subscriptionBilling: 'monthly',
  subscriptionStatus: 'active',
  createdAt: '2026-03-01T08:30:00.000Z'
};

db.users.set(defaultFounder.id, defaultFounder);
db.users.set(defaultCreator.id, defaultCreator);
db.users.set(defaultFreeUser.id, defaultFreeUser);

// Seed initial transactions
db.transactions.push(
  {
    id: 'tx_init_1',
    userId: defaultFounder.id,
    amount: 5000,
    type: 'admin_grant',
    description: 'Founder initial allocation',
    timestamp: '2026-01-15T00:00:00.000Z'
  },
  {
    id: 'tx_init_2',
    userId: defaultCreator.id,
    amount: 500,
    type: 'subscription',
    description: 'Creator Plan monthly renewal (+500 credits)',
    timestamp: '2026-02-10T12:00:00.000Z'
  },
  {
    id: 'tx_init_3',
    userId: defaultCreator.id,
    amount: -80,
    type: 'usage',
    description: 'Generated 3-min Documentary "Deep Ocean Mysteries"',
    timestamp: '2026-02-14T15:20:00.000Z'
  },
  {
    id: 'tx_init_4',
    userId: defaultFreeUser.id,
    amount: 50,
    type: 'subscription',
    description: 'Welcome free tier credits (+50 credits)',
    timestamp: '2026-03-01T08:30:00.000Z'
  }
);

// Seed initial USDT payment record
const seedUsdtPayment: UsdtPaymentRecord = {
  id: 'usdt_pay_init_1',
  userId: defaultCreator.id,
  userEmail: defaultCreator.email,
  userName: defaultCreator.name,
  planId: 'creator',
  planName: 'Creator Studio',
  billingCadence: 'monthly',
  amountUsdt: 29,
  currency: 'USDT',
  network: 'TRC20',
  walletAddress: process.env.USDT_TRC20_ADDRESS || 'TMVfsdPa8eJLXWjQENnHwpsyG86Uxrwpef',
  txid: '9f2a74c8e10398bb55f41cb837d99540b93856da96f7c6a9926a11e8f2371a5b',
  status: 'verified',
  verificationResult: 'Confirmed on TRON network. Received 29.0 USDT.',
  createdAt: '2026-02-10T11:58:00.000Z',
  verifiedAt: '2026-02-10T12:00:00.000Z'
};
db.usdtPayments.set(seedUsdtPayment.id, seedUsdtPayment);
db.usedTxids.add(seedUsdtPayment.txid.toLowerCase());

// Seed initial sample project
const sampleSampleProject: VideoProject = {
  id: 'proj_sample_01',
  userId: defaultFounder.id,
  title: 'Neon Odyssey: Tokyo 2099',
  rawPrompt: 'A cinematic journey through a futuristic cyberpunk city at twilight, flying aero-cars, vibrant neon reflections, and an intrepid courier.',
  creationMode: 'text',
  aspectRatio: '16:9',
  duration: '1m',
  generationMode: 'high_quality',
  style: 'cinematic',
  voice: 'ai_voice',
  voiceLanguage: 'English',
  music: 'ai_music',
  musicMood: 'Synthwave Cinematic Orchestral',
  subtitles: 'auto',
  subtitleStyle: 'bold_social',
  creditCost: 35,
  status: 'completed',
  progressPercentage: 100,
  currentStepMessage: 'Video generation complete & verified',
  createdAt: '2026-03-15T10:00:00.000Z',
  updatedAt: '2026-03-15T10:02:30.000Z',
  creativeBrief: {
    logline: 'In the towering canyons of Neo-Tokyo, a solitary courier navigates the atmospheric skyways during the midnight rush.',
    targetAudience: 'Sci-fi enthusiasts, visual storytellers',
    visualTone: 'High dynamic range, rich cyan and amber neon grading, atmospheric haze',
    narrativePacing: 'Deliberate sweeping crane shots building into energetic velocity'
  },
  characters: [
    {
      id: 'char_ren',
      name: 'Ren Takahashi',
      ageAppearance: 'Late 20s',
      gender: 'Male',
      faceDescription: 'Sharp jawline, focused dark eyes, slight cybernetic accent on left temple',
      hairDescription: 'Messy raven black hair with undercut',
      clothingDescription: 'Weathered dark matte courier jacket with subtle luminous collar trims',
      bodyProportions: 'Athletic, 180cm lean build'
    }
  ],
  chapters: [
    {
      id: 'chap_1',
      chapterNumber: 1,
      title: 'The Skyline Awakens',
      summary: 'Establishing shots of the aerial traffic and atmospheric skyscraper spires.',
      sceneIds: ['sc_1', 'sc_2']
    },
    {
      id: 'chap_2',
      chapterNumber: 2,
      title: 'The Courier Descent',
      summary: 'Ren activates the aero-craft flight systems and enters the canyon lanes.',
      sceneIds: ['sc_3', 'sc_4']
    }
  ],
  scenes: [
    {
      id: 'sc_1',
      chapterId: 'chap_1',
      sceneNumber: 1,
      durationSeconds: 15,
      title: 'Panoramic Skyline Vista',
      visualPrompt: 'Wide panoramic drone shot soaring over towering glass spires of Neo-Tokyo, holographic billboards reflecting on rain-dampened architectural glass, stream of floating vehicles with soft neon trails.',
      cameraMovement: 'Slow forward crane descent with panoramic tilt',
      lighting: 'Twilight twilight with deep purples and warm amber reflections',
      narrationText: 'The city never sleeps. Above the endless grid, the skyways hum with the pulse of ten million lives.',
      subtitleText: 'The city never sleeps. Above the endless grid...',
      status: 'completed',
      retryCount: 0,
      thumbnailUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg',
      mediaUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg'
    },
    {
      id: 'sc_2',
      chapterId: 'chap_1',
      sceneNumber: 2,
      durationSeconds: 15,
      title: 'Traffic Corridors',
      visualPrompt: 'Medium tracking shot alongside a streamlined aero-car navigating dense multilevel sky traffic, holographic highway markers illuminating the cockpit silhouette.',
      cameraMovement: 'Fast parallel tracking shot',
      lighting: 'Dynamic neon pulses, high contrast highlights',
      narrationText: 'Every second counts when information is the ultimate currency.',
      subtitleText: 'Every second counts when information is the currency.',
      status: 'completed',
      retryCount: 0,
      thumbnailUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg',
      mediaUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg'
    },
    {
      id: 'sc_3',
      chapterId: 'chap_2',
      sceneNumber: 3,
      durationSeconds: 15,
      title: 'Cockpit View: Courier Focus',
      visualPrompt: 'Over-the-shoulder close shot of Ren Takahashi in the aero-craft cockpit, hands steady on the tactile holographic flight controls, reflection of neon city lights glistening in his visor.',
      cameraMovement: 'Steady handheld style with subtle vibration',
      lighting: 'Interior ambient console glow with exterior streetlamp strobes',
      narrationText: 'Down through the lower sectors, where the clouds meet the steam of the street markets.',
      subtitleText: 'Down through the lower sectors, where the clouds meet the steam.',
      characterIds: ['char_ren'],
      status: 'completed',
      retryCount: 0,
      thumbnailUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg',
      mediaUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg'
    },
    {
      id: 'sc_4',
      chapterId: 'chap_2',
      sceneNumber: 4,
      durationSeconds: 15,
      title: 'The Final Horizon',
      visualPrompt: 'Cinematic wide low-angle shot as the courier craft arcs upward into the open horizon above Mount Fuji bathed in auroral artificial clouds.',
      cameraMovement: 'Soaring upward tilt following the vehicle departure',
      lighting: 'Golden dawn breaking over purple horizon glow',
      narrationText: 'In the end, only the velocity and the open sky remain.',
      subtitleText: 'In the end, only velocity and the open sky remain.',
      status: 'completed',
      retryCount: 0,
      thumbnailUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg',
      mediaUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg'
    }
  ],
  thumbnailUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg',
  hasWatermark: false,
  isPublicShare: true,
  shareId: 'neon-odyssey-tokyo'
};

db.projects.set(sampleSampleProject.id, sampleSampleProject);

// Seed initial templates
db.templates = [
  {
    id: 'tmpl_cinematic_trailer',
    title: 'Cinematic Film Trailer',
    category: 'Cinematic',
    description: 'Dramatic lighting, anamorphic aspect ratio, orchestral scoring, and high-tension scene pacing.',
    suggestedAspectRatio: '16:9',
    suggestedDuration: '1m',
    suggestedStyle: 'cinematic',
    promptPlaceholder: 'An epic historical tale of an expedition navigating unexplored subterranean caves...',
    previewThumbnailUrl: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg',
    tags: ['Trailer', 'Hollywood', 'Dramatic', 'Orchestral']
  },
  {
    id: 'tmpl_space_documentary',
    title: 'Cosmic Documentary',
    category: 'Documentary',
    description: 'Attenborough-style deep scientific narration, celestial visuals, and tranquil orchestral pacing.',
    suggestedAspectRatio: '16:9',
    suggestedDuration: '5m',
    suggestedStyle: 'documentary',
    promptPlaceholder: 'The birth of stars inside the Eagle Nebula and the quest for exoplanets...',
    previewThumbnailUrl: '/src/assets/images/sample_nature_documentary_1790906712047.jpg',
    tags: ['Science', 'Space', 'Educational', 'Cosmos']
  },
  {
    id: 'tmpl_product_ad',
    title: 'Luxury Tech Commercial',
    category: 'Advertisement',
    description: 'Studio turntable lighting, crisp macro textures, energetic beats, and high-converting CTA.',
    suggestedAspectRatio: '16:9',
    suggestedDuration: '30s',
    suggestedStyle: 'product_commercial',
    promptPlaceholder: 'Introducing our minimalist mechanical keyboard forged from aerospace-grade titanium...',
    previewThumbnailUrl: '/src/assets/images/sample_commercial_ad_1790906723033.jpg',
    tags: ['Product', 'Brand', 'Commercial', 'Minimalist']
  },
  {
    id: 'tmpl_anime_saga',
    title: 'Anime Shonen Opening',
    category: 'Anime',
    description: 'Dynamic character poses, floating islands, golden-hour cloudscapes, and emotional orchestral rock.',
    suggestedAspectRatio: '16:9',
    suggestedDuration: '1m',
    suggestedStyle: 'anime',
    promptPlaceholder: 'A young wind mage who discovers an ancient floating academy at the edge of the world...',
    previewThumbnailUrl: '/src/assets/images/sample_anime_fantasy_1790906733934.jpg',
    tags: ['Anime', 'Fantasy', 'Makoto Shinkai', 'Adventure']
  },
  {
    id: 'tmpl_social_tiktok',
    title: 'Viral TikTok Storytime',
    category: 'TikTok',
    description: 'Fast cuts, bold center-weighted captions, hook in first 2 seconds, high retention sound design.',
    suggestedAspectRatio: '9:16',
    suggestedDuration: '30s',
    suggestedStyle: 'realistic',
    promptPlaceholder: '3 psychological tricks that world-class negotiators use in daily conversations...',
    previewThumbnailUrl: '/src/assets/images/sample_commercial_ad_1790906723033.jpg',
    tags: ['TikTok', 'Reels', 'Shorts', 'Viral']
  },
  {
    id: 'tmpl_educational_explainer',
    title: 'Deep Dive Explainer',
    category: 'Education',
    description: 'Structured chapters, clean conceptual metaphors, step-by-step breakdown with clear subtitles.',
    suggestedAspectRatio: '16:9',
    suggestedDuration: '3m',
    suggestedStyle: '3d',
    promptPlaceholder: 'How quantum computers solve problems that take classical supercomputers millennia...',
    previewThumbnailUrl: '/src/assets/images/sample_nature_documentary_1790906712047.jpg',
    tags: ['Education', 'Tech', 'Visual Explainer', 'Learning']
  }
];
