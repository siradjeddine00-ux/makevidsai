import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  FileText, 
  BookOpen, 
  ShoppingBag, 
  Smartphone, 
  AlertTriangle, 
  Check, 
  Mic, 
  Music, 
  Subtitles, 
  Sliders, 
  PlaySquare, 
  HelpCircle,
  Clock,
  Layers
} from 'lucide-react';
import { 
  CreationMode, 
  VideoAspectRatio, 
  VideoDuration, 
  VideoGenerationMode, 
  VideoStyle, 
  VoiceOption, 
  MusicOption, 
  SubtitleOption, 
  UserProfile 
} from '../types';
import { aiService } from '../services/ai';
import { PuterVoice } from '../providers/puter/types';

interface VideoCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onSubmit: (params: {
    prompt: string;
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
    subtitleStyle: 'modern' | 'bold_social' | 'karaoke' | 'classic';
    scriptText?: string;
    imageUrl?: string;
  }) => void;
  initialPrompt?: string;
  initialMode?: CreationMode;
  initialDuration?: VideoDuration;
  initialStyle?: VideoStyle;
}

export const VideoCreatorModal: React.FC<VideoCreatorModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSubmit,
  initialPrompt = '',
  initialMode = 'text',
  initialDuration = '30s',
  initialStyle = 'cinematic'
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [creationMode, setCreationMode] = useState<CreationMode>(initialMode);
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [duration, setDuration] = useState<VideoDuration>(initialDuration);
  const [generationMode, setGenerationMode] = useState<VideoGenerationMode>('fast');
  const [style, setStyle] = useState<VideoStyle>(initialStyle);
  const [voice, setVoice] = useState<VoiceOption>('ai_voice');
  const [voiceLanguage, setVoiceLanguage] = useState('English');
  const [music, setMusic] = useState<MusicOption>('ai_music');
  const [musicMood, setMusicMood] = useState('Cinematic Ambient');
  const [subtitles, setSubtitles] = useState<SubtitleOption>('auto');
  const [subtitleStyle, setSubtitleStyle] = useState<'modern' | 'bold_social' | 'karaoke' | 'classic'>('bold_social');
  
  // Specific mode inputs
  const [scriptText, setScriptText] = useState('');
  const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
  const [selectedSocialPreset, setSelectedSocialPreset] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isDraftingScript, setIsDraftingScript] = useState(false);
  const [dynamicVoices, setDynamicVoices] = useState<PuterVoice[]>([]);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([
    'English', 'Arabic', 'French', 'Spanish', 'Japanese', 'German'
  ]);

  // Load real Puter.js voices dynamically
  React.useEffect(() => {
    aiService.listVoices().then(voices => {
      if (voices && voices.length > 0) {
        setDynamicVoices(voices);
        const langs = Array.from(new Set(voices.map(v => v.language).filter(Boolean))) as string[];
        if (langs.length > 0) setAvailableLanguages(langs);
      }
    }).catch(e => console.warn('Puter voices discovery note:', e));
  }, []);

  // High credit confirmation modal state
  const [showCreditConfirm, setShowCreditConfirm] = useState(false);

  const handleGenerateImageWithPuter = async () => {
    setIsGeneratingImage(true);
    try {
      const imgPrompt = prompt.trim() || 'Cinematic character portrait in futuristic atmospheric neon city';
      const imgUrl = await aiService.generateImage(imgPrompt);
      if (imgUrl) {
        setUploadedImageName('AI_Generated_Puter_Visual.png');
      }
    } catch (e) {
      console.warn('Image generation note:', e);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDraftScriptWithPuter = async () => {
    setIsDraftingScript(true);
    try {
      const topic = prompt.trim() || 'A compelling 1-minute sci-fi narrative';
      const draft = await aiService.generateScript(`Write a structured screenplay script with scenes and narration for: ${topic}`);
      if (draft) {
        setScriptText(draft);
      }
    } catch (e) {
      console.warn('Script generation note:', e);
    } finally {
      setIsDraftingScript(false);
    }
  };

  // Sync state if props change
  React.useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
    if (initialMode) setCreationMode(initialMode);
    if (initialDuration) setDuration(initialDuration);
    if (initialStyle) setStyle(initialStyle);
  }, [initialPrompt, initialMode, initialDuration, initialStyle]);

  if (!isOpen) return null;

  // Credit calculation logic
  const calculateCredits = (): number => {
    let base = 20;
    switch (duration) {
      case '15s': base = 10; break;
      case '30s': base = 20; break;
      case '1m': base = 35; break;
      case '3m': base = 75; break;
      case '5m': base = 120; break;
      case '10m': base = 240; break;
      case '15m': base = 360; break;
      case '20m': base = 480; break;
      case '30m': base = 700; break;
    }
    if (generationMode === 'high_quality') base = Math.round(base * 1.25);
    return base;
  };

  const estimatedCredits = calculateCredits();
  const isHighCost = estimatedCredits >= 240;
  const userHasEnough = (currentUser?.credits || 0) >= estimatedCredits;

  const handleStartGeneration = () => {
    if (!prompt.trim() && !scriptText.trim()) return;

    if (isHighCost && !showCreditConfirm) {
      setShowCreditConfirm(true);
      return;
    }

    setShowCreditConfirm(false);
    onSubmit({
      prompt: prompt.trim() || scriptText.slice(0, 100),
      creationMode,
      aspectRatio,
      duration,
      generationMode,
      style,
      voice,
      voiceLanguage,
      music,
      musicMood,
      subtitles,
      subtitleStyle,
      scriptText: scriptText.trim() || undefined,
      imageUrl: uploadedImageName ? '/src/assets/images/sample_commercial_ad_1790906723033.jpg' : undefined
    });
  };

  const applySocialPreset = (preset: string) => {
    setSelectedSocialPreset(preset);
    switch (preset) {
      case 'tiktok':
        setAspectRatio('9:16');
        setDuration('30s');
        setStyle('realistic');
        setSubtitles('auto');
        setSubtitleStyle('bold_social');
        break;
      case 'reels':
        setAspectRatio('9:16');
        setDuration('30s');
        setStyle('cinematic');
        setSubtitles('auto');
        setSubtitleStyle('bold_social');
        break;
      case 'shorts':
        setAspectRatio('9:16');
        setDuration('1m');
        setStyle('cinematic');
        setSubtitles('auto');
        setSubtitleStyle('karaoke');
        break;
      case 'youtube':
        setAspectRatio('16:9');
        setDuration('5m');
        setStyle('documentary');
        setSubtitles('auto');
        setSubtitleStyle('modern');
        break;
      case 'product_ad':
        setAspectRatio('16:9');
        setDuration('30s');
        setStyle('product_commercial');
        setSubtitles('auto');
        setSubtitleStyle('bold_social');
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border border-neutral-800 bg-neutral-900 p-5 sm:p-6 shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Create New Video
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Describe your idea. MakeVidsAI structures the script, scenes, and narration.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Creation Modes Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-950/70 rounded-xl border border-neutral-800/80 mb-4 text-xs font-medium">
          {[
            { id: 'text', label: 'Text to Video', icon: Sparkles },
            { id: 'image', label: 'Image to Video', icon: Upload },
            { id: 'script', label: 'Script to Video', icon: FileText },
            { id: 'story', label: 'AI Story', icon: BookOpen },
            { id: 'ad', label: 'AI Ad Creator', icon: ShoppingBag }
          ].map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setCreationMode(mode.id as CreationMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  creationMode === mode.id
                    ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Quick Social Presets */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-neutral-500 whitespace-nowrap">Presets:</span>
          {[
            { id: 'tiktok', label: 'TikTok (9:16)' },
            { id: 'reels', label: 'IG Reels (9:16)' },
            { id: 'shorts', label: 'YT Shorts (9:16)' },
            { id: 'youtube', label: 'YouTube (16:9)' },
            { id: 'product_ad', label: 'Product Ad' }
          ].map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applySocialPreset(preset.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap border transition-colors cursor-pointer ${
                selectedSocialPreset === preset.id
                  ? 'border-indigo-500/60 bg-indigo-500/10 text-indigo-300'
                  : 'border-neutral-800 bg-neutral-950/40 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Dynamic Inputs according to mode */}
        <div className="space-y-4 mb-4">
          {creationMode === 'image' && (
            <div className="rounded-xl border border-dashed border-neutral-700 bg-neutral-950/40 p-4 text-center">
              <Upload className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-neutral-200">
                {uploadedImageName ? `Uploaded: ${uploadedImageName}` : 'Upload starting image to animate'}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Supports PNG, JPG, WebP up to 25MB
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setUploadedImageName('cyber_courier_portrait.jpg')}
                  className="font-semibold text-neutral-400 hover:text-white cursor-pointer"
                >
                  {uploadedImageName ? 'Change Image' : 'Select Sample Image'}
                </button>
                <span className="text-neutral-600">·</span>
                <button
                  type="button"
                  disabled={isGeneratingImage}
                  onClick={handleGenerateImageWithPuter}
                  className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  {isGeneratingImage ? 'Generating Image...' : 'Generate with Puter.js'}
                </button>
              </div>
            </div>
          )}

          {creationMode === 'script' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-neutral-300">
                  Paste your complete script
                </label>
                <button
                  type="button"
                  disabled={isDraftingScript}
                  onClick={handleDraftScriptWithPuter}
                  className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  {isDraftingScript ? 'Writing with Puter AI...' : 'Draft with Puter AI'}
                </button>
              </div>
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="INT. COMMAND CENTER - NIGHT&#10;Commander Vance stares at the radar array. An anomalous cosmic pulse lights up Sector 4..."
                rows={4}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-none"
              />
              <p className="text-[11px] text-neutral-500 mt-1">
                MakeVidsAI will automatically break your script into scenes, generate visual prompts, and align narration.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                {creationMode === 'image'
                  ? 'Describe how you want this image animated'
                  : creationMode === 'story'
                  ? 'Describe your story premise & characters'
                  : creationMode === 'ad'
                  ? 'Describe your product, hook, and offer'
                  : 'What do you want to create?'}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  creationMode === 'image'
                    ? 'Slow cinematic camera movement, wind blowing through character hair, realistic lighting'
                    : creationMode === 'story'
                    ? 'A 10-minute mystery about a clockmaker who discovers a pocket watch that rewinds time 30 seconds'
                    : creationMode === 'ad'
                    ? 'A 30-second commercial for eco-friendly titanium sunglasses with dynamic studio turntable shots'
                    : 'A cinematic journey through a futuristic cyberpunk city at night with flying aero-cars and dramatic camera angles'
                }
                rows={3}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Video Settings Grid */}
        <div className="rounded-xl border border-neutral-800/80 bg-neutral-950/60 p-4 space-y-3.5 mb-5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Aspect Ratio */}
            <div>
              <span className="block text-[11px] font-medium text-neutral-400 mb-1">Aspect Ratio</span>
              <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                {(['16:9', '9:16', '1:1'] as VideoAspectRatio[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setAspectRatio(r)}
                    className={`py-1 rounded text-center text-[11px] font-medium cursor-pointer ${
                      aspectRatio === r ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div>
              <span className="block text-[11px] font-medium text-neutral-400 mb-1">Duration</span>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value as VideoDuration)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="15s">15 Seconds</option>
                <option value="30s">30 Seconds</option>
                <option value="1m">1 Minute</option>
                <option value="3m">3 Minutes</option>
                <option value="5m">5 Minutes</option>
                <option value="10m">10 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="20m">20 Minutes</option>
                <option value="30m">30 Minutes (Long Video)</option>
              </select>
            </div>

            {/* Style */}
            <div>
              <span className="block text-[11px] font-medium text-neutral-400 mb-1">Visual Style</span>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value as VideoStyle)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="cinematic">Cinematic</option>
                <option value="realistic">Realistic</option>
                <option value="anime">Anime</option>
                <option value="3d">3D Animation</option>
                <option value="cartoon">Cartoon</option>
                <option value="documentary">Documentary</option>
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="product_commercial">Product Commercial</option>
                <option value="custom">Custom Prompted</option>
              </select>
            </div>

            {/* Mode */}
            <div>
              <span className="block text-[11px] font-medium text-neutral-400 mb-1">Quality Mode</span>
              <div className="grid grid-cols-2 gap-1 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
                <button
                  type="button"
                  onClick={() => setGenerationMode('fast')}
                  className={`py-1 rounded text-center text-[11px] font-medium cursor-pointer ${
                    generationMode === 'fast' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  Fast
                </button>
                <button
                  type="button"
                  onClick={() => setGenerationMode('high_quality')}
                  className={`py-1 rounded text-center text-[11px] font-medium cursor-pointer ${
                    generationMode === 'high_quality' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  High Quality
                </button>
              </div>
            </div>
          </div>

          {/* Voice, Music, Subtitles options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-900">
            {/* Voice */}
            <div>
              <span className="block text-[11px] font-medium text-neutral-400 mb-1">Narration Voice</span>
              <div className="flex items-center gap-1.5">
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value as VoiceOption)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="ai_voice">AI Voice (Auto Natural)</option>
                  {dynamicVoices
                    .filter(v => !v.language || v.language.toLowerCase() === voiceLanguage.toLowerCase())
                    .map(v => (
                      <option key={v.id || v.name} value={v.name}>
                        {v.name} ({v.provider || 'Puter'})
                      </option>
                    ))}
                  <option value="none">No Voice</option>
                </select>
                <select
                  value={voiceLanguage}
                  onChange={(e) => setVoiceLanguage(e.target.value)}
                  className="w-28 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                >
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Music */}
            <div>
              <span className="block text-[11px] font-medium text-neutral-400 mb-1">Soundtrack</span>
              <select
                value={music}
                onChange={(e) => setMusic(e.target.value as MusicOption)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
              >
                <option value="ai_music">AI Generated Music</option>
                <option value="upload_music">Upload Music</option>
                <option value="none">No Music</option>
              </select>
            </div>

            {/* Subtitles */}
            <div>
              <span className="block text-[11px] font-medium text-neutral-400 mb-1">Subtitles</span>
              <div className="flex items-center gap-1.5">
                <select
                  value={subtitles}
                  onChange={(e) => setSubtitles(e.target.value as SubtitleOption)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="auto">Auto Subtitles</option>
                  <option value="off">Off</option>
                </select>
                {subtitles === 'auto' && (
                  <select
                    value={subtitleStyle}
                    onChange={(e) => setSubtitleStyle(e.target.value as any)}
                    className="w-28 rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1.5 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="bold_social">Bold Social</option>
                    <option value="modern">Modern Clean</option>
                    <option value="karaoke">Karaoke</option>
                    <option value="classic">Classic Film</option>
                  </select>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* High Credit Confirmation Safeguard Modal (Section 41) */}
        {showCreditConfirm && (
          <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 p-4 mb-4 text-xs text-amber-200">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white">Confirm Long-Form Video Generation</h4>
                <p className="mt-1 text-neutral-300">
                  You are generating a {duration} project. This will consume{' '}
                  <span className="font-mono font-bold text-amber-400">{estimatedCredits} credits</span>.
                  The project will construct structured chapters, consistent character models, and individual scenes with automatic retry fault-tolerance.
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleStartGeneration}
                    className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:bg-amber-400 cursor-pointer"
                  >
                    Confirm & Start Generation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreditConfirm(false)}
                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white cursor-pointer"
                  >
                    Adjust Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer: Credit cost & main action */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-neutral-800/80">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-400">Estimated Cost:</span>
            <span className="font-mono font-bold text-white tabular-nums">{estimatedCredits} Credits</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className={`text-[11px] ${userHasEnough ? 'text-neutral-400' : 'text-rose-400 font-semibold'}`}>
              Available: {currentUser?.credits ?? 0}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-800 px-4 py-2 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!prompt.trim() && !scriptText.trim()}
              onClick={handleStartGeneration}
              className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold shadow-lg transition-all cursor-pointer ${
                userHasEnough
                  ? 'bg-indigo-600 text-white shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              Generate Video ✨
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
