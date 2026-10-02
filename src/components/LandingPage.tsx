import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  ArrowRight, 
  Upload, 
  FileText, 
  Mic, 
  Music, 
  Clock, 
  Ratio, 
  Film, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Tv, 
  HelpCircle,
  Volume2,
  Subtitles,
  Users
} from 'lucide-react';
import { VideoAspectRatio, VideoDuration, VideoStyle } from '../types';

interface LandingPageProps {
  onQuickGenerate: (prompt: string, options?: any) => void;
  onExploreTemplates: () => void;
  onOpenPricing: () => void;
  onPreviewSampleVideo: (sampleId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onQuickGenerate,
  onExploreTemplates,
  onOpenPricing,
  onPreviewSampleVideo
}) => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [duration, setDuration] = useState<VideoDuration>('30s');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [hasScript, setHasScript] = useState(false);
  const [hasImage, setHasImage] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const defaultPlaceholder = "A cinematic journey through a futuristic city at night, with flying cars, neon lights, realistic people, and dramatic camera movements.";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalPrompt = prompt.trim() || defaultPlaceholder;
    onQuickGenerate(finalPrompt, {
      aspectRatio,
      duration,
      voice: voiceEnabled ? 'ai_voice' : 'none',
      music: musicEnabled ? 'ai_music' : 'none',
      creationMode: hasImage ? 'image' : hasScript ? 'script' : 'text'
    });
  };

  const sampleVideos = [
    {
      id: 'proj_sample_01',
      title: 'Neon Odyssey: Tokyo 2099',
      category: 'Sci-Fi Cinematic',
      duration: '1m',
      aspectRatio: '16:9',
      image: '/src/assets/images/hero_sample_cinematic_1790906701150.jpg',
      prompt: 'Cinematic journey through neon canyons with flying aero-vehicles and atmospheric reflections'
    },
    {
      id: 'sample_space',
      title: 'Stellar Nursery: Pillars of Creation',
      category: 'Documentary',
      duration: '5m',
      aspectRatio: '16:9',
      image: '/src/assets/images/sample_nature_documentary_1790906712047.jpg',
      prompt: 'Cosmic space exploration documentary with deep scientific narration and celestial nebulae'
    },
    {
      id: 'sample_ad',
      title: 'Titanium Chrono Series X',
      category: 'Product Commercial',
      duration: '30s',
      aspectRatio: '16:9',
      image: '/src/assets/images/sample_commercial_ad_1790906723033.jpg',
      prompt: 'Sleek luxury product commercial with dynamic studio rim lighting and high-converting CTA'
    },
    {
      id: 'sample_anime',
      title: 'Chronicles of the Wind Maiden',
      category: 'Anime Fantasy',
      duration: '1m',
      aspectRatio: '16:9',
      image: '/src/assets/images/sample_anime_fantasy_1790906733934.jpg',
      prompt: 'Emotional anime fantasy sequence with floating islands and golden sunset lighting'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Subtle backdrop ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[450px] bg-gradient-to-b from-indigo-500/10 via-violet-600/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          {/* Editorial tag line */}
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-xs text-neutral-400 border border-neutral-800 bg-neutral-900/60 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span>MakeVidsAI Pipeline Engine</span>
            <span aria-hidden="true" className="text-neutral-600">·</span>
            <span className="text-neutral-300">Up to 30-Minute Generation</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl md:text-7xl leading-none">
            Create amazing videos <br />
            <span className="bg-gradient-to-r from-indigo-300 via-white to-violet-300 bg-clip-text text-transparent">
              with AI
            </span>
          </h1>

          <p className="mt-6 text-lg text-neutral-400 sm:text-xl max-w-2xl mx-auto leading-relaxed">
            Turn your ideas, scripts, and images into professional videos in minutes.
            Your idea. One prompt. One video.
          </p>

          {/* Main Prompt Box */}
          <form onSubmit={handleSubmit} className="mt-10 mx-auto max-w-3xl">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/90 p-3 shadow-2xl shadow-black/80 backdrop-blur-md transition-all focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={defaultPlaceholder}
                rows={3}
                className="w-full resize-none bg-transparent p-3 text-sm sm:text-base text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
              />

              {/* Quick Settings Bar below prompt box */}
              <div className="border-t border-neutral-800/80 pt-3 mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Upload Image Toggle */}
                  <button
                    type="button"
                    onClick={() => setHasImage(!hasImage)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      hasImage
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>{hasImage ? 'Image Attached' : 'Upload Image'}</span>
                  </button>

                  {/* Add Script Toggle */}
                  <button
                    type="button"
                    onClick={() => setHasScript(!hasScript)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors cursor-pointer ${
                      hasScript
                        ? 'border-indigo-500 bg-indigo-500/20 text-indigo-300'
                        : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>{hasScript ? 'Script Ready' : 'Add Script'}</span>
                  </button>

                  {/* Aspect Ratio Picker */}
                  <div className="flex items-center gap-1 bg-neutral-800/40 p-0.5 rounded-md border border-neutral-800">
                    {(['16:9', '9:16', '1:1'] as VideoAspectRatio[]).map((ratio) => (
                      <button
                        key={ratio}
                        type="button"
                        onClick={() => setAspectRatio(ratio)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          aspectRatio === ratio
                            ? 'bg-neutral-700 text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {ratio}
                      </button>
                    ))}
                  </div>

                  {/* Duration Picker */}
                  <div className="flex items-center gap-1 bg-neutral-800/40 p-0.5 rounded-md border border-neutral-800">
                    {(['30s', '1m', '5m', '10m', '30m'] as VideoDuration[]).map((dur) => (
                      <button
                        key={dur}
                        type="button"
                        onClick={() => setDuration(dur)}
                        className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                          duration === dur
                            ? 'bg-neutral-700 text-white'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {dur}
                      </button>
                    ))}
                  </div>

                  {/* Voice and Music quick indicators */}
                  <button
                    type="button"
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                      voiceEnabled
                        ? 'border-neutral-700 bg-neutral-800 text-neutral-200'
                        : 'border-neutral-800 text-neutral-500 line-through'
                    }`}
                  >
                    <Mic className="h-3 w-3" />
                    Voice
                  </button>

                  <button
                    type="button"
                    onClick={() => setMusicEnabled(!musicEnabled)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] border transition-colors cursor-pointer ${
                      musicEnabled
                        ? 'border-neutral-700 bg-neutral-800 text-neutral-200'
                        : 'border-neutral-800 text-neutral-500 line-through'
                    }`}
                  >
                    <Music className="h-3 w-3" />
                    Music
                  </button>
                </div>

                {/* Primary Generate Action */}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0">
                  <button
                    type="submit"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-98 transition-all cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-indigo-200" />
                    Generate Video ✨
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-neutral-500">
              <span>No professional editing skills required</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onExploreTemplates}
                className="text-neutral-400 hover:text-indigo-400 underline underline-offset-4 cursor-pointer"
              >
                Or explore pre-designed templates →
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Sample AI-Generated Videos Showcase */}
      <section className="py-12 border-t border-neutral-900 bg-neutral-950/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
                Created with MakeVidsAI
              </p>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">
                Sample AI-Generated Masterpieces
              </h2>
            </div>
            <button
              onClick={onExploreTemplates}
              className="text-xs font-medium text-neutral-400 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              Explore all templates <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleVideos.map((sample) => (
              <div
                key={sample.id}
                onClick={() => onPreviewSampleVideo(sample.id)}
                className="group relative rounded-xl border border-neutral-800/80 bg-neutral-900/60 overflow-hidden cursor-pointer hover:border-neutral-700 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-black/50"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                  <img
                    src={sample.image}
                    alt={sample.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/90 via-neutral-950/30 to-transparent" />
                  
                  {/* Play badge */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-lg shadow-black/40">
                      <Play className="h-5 w-5 fill-neutral-950 ml-0.5" />
                    </div>
                  </div>

                  <div className="absolute top-2 right-2 rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                    {sample.duration}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-neutral-400 mb-1">
                    <span>{sample.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{sample.aspectRatio}</span>
                  </div>
                  <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {sample.title}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {sample.prompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-3 text-neutral-400 text-sm sm:text-base">
              From thought to high-definition video in three effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 font-mono font-bold text-sm">
                01
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Describe your video</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Enter your idea in plain natural language, paste a full screenplay script, or upload a reference character or product photo.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 font-mono font-bold text-sm">
                02
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Choose settings</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                Select duration (from 15 seconds to 30 minutes), aspect ratio, visual aesthetic, AI voice persona, and musical mood.
              </p>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-4 font-mono font-bold text-sm">
                03
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Generate & Edit</h3>
              <p className="text-sm text-neutral-400 leading-relaxed">
                The orchestration layer writes scripts, plans scenes, keeps character consistency, and renders the synchronized video ready to share.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Long Video Creation Section (Up to 30 minutes) */}
      <section id="long-video" className="py-20 border-t border-neutral-900 bg-neutral-900/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold text-indigo-300 border border-indigo-500/30 bg-indigo-500/10 rounded-full">
                <span>Game-Changing Capability</span>
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Long Video Creation — Up to 30 Minutes
              </h2>
              <p className="mt-4 text-neutral-300 text-sm sm:text-base leading-relaxed">
                Conventional AI video platforms max out at 5 seconds. MakeVidsAI implements a full multi-stage long-video pipeline that structures 30-minute documentaries, comprehensive educational lectures, and deep narrative sagas.
              </p>

              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Hierarchical Chapter & Sequence Division</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Stories are systematically broken down into distinct narrative chapters, ensuring perfect pacing from introduction to climax.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Fault-Tolerant Scene Retry System</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      If scene 17 of 86 encounters an error, the system automatically retries that single scene without wasting or restarting the whole project.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">Character & Style Consistency</h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Characters maintain identical face shapes, clothing, hair, and body proportions across dozens of scenes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Pipeline progress simulation card */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
                <div>
                  <h4 className="text-sm font-semibold text-white">Space Exploration Documentary</h4>
                  <p className="text-xs text-neutral-400">Target Duration: 20 Minutes · 56 Scenes</p>
                </div>
                <span className="text-xs font-mono text-indigo-400 font-semibold">Processing</span>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs text-neutral-300 mb-1.5">
                    <span>Scene Generation</span>
                    <span className="font-mono text-indigo-400">Scene 17 / 56</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full w-[34%]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-2.5">
                    <span className="text-neutral-500 block text-[10px]">Chapter 1</span>
                    <span className="text-neutral-200 font-medium">The Spark of Genesis</span>
                    <span className="text-[10px] text-emerald-400 block mt-1">✓ 8 Scenes Complete</span>
                  </div>
                  <div className="rounded-lg border border-neutral-800/80 bg-neutral-950/60 p-2.5">
                    <span className="text-neutral-500 block text-[10px]">Chapter 2</span>
                    <span className="text-neutral-200 font-medium">Voyage to the Gas Giants</span>
                    <span className="text-[10px] text-indigo-400 block mt-1">Generating Scene 17...</span>
                  </div>
                </div>

                <div className="rounded-lg bg-neutral-950/80 border border-neutral-800 p-3 text-xs text-neutral-400 font-mono">
                  <p className="text-neutral-300 font-sans font-semibold mb-1">Character Consistency Tracker</p>
                  <p className="text-[11px] text-neutral-400">
                    Protagonist: Dr. Elena Vance · Blue astronaut suit · Visual signature preserved across 14 shots.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Grid */}
      <section id="features" className="py-20 border-t border-neutral-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Complete AI Video Capabilities
            </h2>
            <p className="mt-3 text-neutral-400 text-sm sm:text-base">
              Every tool you need to produce cinematic reels, viral shorts, and documentary features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Film,
                title: 'Text to Video',
                desc: 'Turn single-line concepts into multi-scene videos with dynamic camera pans and studio lighting.'
              },
              {
                icon: Upload,
                title: 'Image to Video',
                desc: 'Animate still photographs, character concept art, or product shots into motion picture sequences.'
              },
              {
                icon: FileText,
                title: 'Script to Video',
                desc: 'Paste a full written script; the AI parses dialogue, estimates timing, and choreographs scenes.'
              },
              {
                icon: Tv,
                title: 'AI Commercials & Ads',
                desc: 'Create high-converting social product ads with hook, problem, solution, and clear call-to-actions.'
              },
              {
                icon: Users,
                title: 'Character Consistency',
                desc: 'Maintain faces, hair, clothing, and body proportions across diverse scenes and angles.'
              },
              {
                icon: Mic,
                title: 'AI Voiceover & Dubbing',
                desc: 'Humanlike voiceovers in English, Arabic, French, and other languages with emotional inflections.'
              },
              {
                icon: Music,
                title: 'AI Music & Sound Design',
                desc: 'Context-aware background scores and sound effects synchronized to narrative beats.'
              },
              {
                icon: Subtitles,
                title: 'Auto Subtitles',
                desc: 'Bold, social-optimized animated captions that boost engagement across TikTok and Reels.'
              },
              {
                icon: RefreshCw,
                title: '"Tell AI What to Change"',
                desc: 'Request natural changes like "change lighting to sunset" or "make camera slower" for any scene.'
              }
            ].map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-6 hover:border-neutral-700 transition-colors"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-3">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-1.5">{feat.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 border-t border-neutral-900 bg-neutral-900/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-3 text-neutral-400 text-sm sm:text-base">
              Choose the plan tailored for your creative ambitions.
            </p>

            {/* Monthly / Yearly Toggle */}
            <div className="mt-6 inline-flex items-center gap-1 p-1 bg-neutral-900 rounded-lg border border-neutral-800">
              <button
                type="button"
                onClick={() => setBillingPeriod('monthly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  billingPeriod === 'monthly'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Monthly Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingPeriod('yearly')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  billingPeriod === 'yearly'
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                Yearly Billing (Save 20%)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Free</span>
                <h3 className="text-xl font-bold text-white mt-1">Starter</h3>
                <p className="text-xs text-neutral-400 mt-2">For curious creators exploring AI video generation.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">$0</span>
                  <span className="text-xs text-neutral-400">/ month</span>
                </div>
                <div className="mt-6 space-y-2.5 text-xs text-neutral-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> 50 credits per month</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Up to 1-minute video duration</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Standard AI generation speed</div>
                  <div className="flex items-center gap-2 text-neutral-500"><CheckCircle2 className="h-4 w-4 text-neutral-600" /> MakeVidsAI watermark included</div>
                </div>
              </div>
              <button
                onClick={onOpenPricing}
                className="mt-8 w-full rounded-xl border border-neutral-700 bg-neutral-800/80 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
            </div>

            {/* Creator (Highlighted) */}
            <div className="rounded-2xl border border-indigo-500/50 bg-neutral-900/90 p-7 flex flex-col justify-between relative shadow-xl shadow-indigo-500/10">
              <div className="absolute -top-3 right-6 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">
                Popular
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Creator</span>
                <h3 className="text-xl font-bold text-white mt-1">Studio Pro</h3>
                <p className="text-xs text-neutral-400 mt-2">For YouTubers, marketers, and content creators.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {billingPeriod === 'yearly' ? '24' : '29'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">USDT</span>
                  <span className="text-xs text-neutral-400">/ month</span>
                </div>
                <div className="mt-6 space-y-2.5 text-xs text-neutral-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> 500 credits per month</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Up to 10-minute video duration</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> No watermark · 1080p Full HD</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Full chapter & scene editor</div>
                </div>
              </div>
              <button
                onClick={onOpenPricing}
                className="mt-8 w-full rounded-xl bg-emerald-600 py-2.5 text-xs font-semibold text-white hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                Pay with USDT (TRC20 / ERC20)
              </button>
            </div>

            {/* Pro */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-7 flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Pro</span>
                <h3 className="text-xl font-bold text-white mt-1">Long Video Mastery</h3>
                <p className="text-xs text-neutral-400 mt-2">For documentary filmmakers and production agencies.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">
                    {billingPeriod === 'yearly' ? '65' : '79'}
                  </span>
                  <span className="text-xs font-bold text-emerald-400">USDT</span>
                  <span className="text-xs text-neutral-400">/ month</span>
                </div>
                <div className="mt-6 space-y-2.5 text-xs text-neutral-300">
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> 1,500 credits per month</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Full 30-minute long video support</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Character consistency memory</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-indigo-400" /> Priority GPU rendering queue</div>
                </div>
              </div>
              <button
                onClick={onOpenPricing}
                className="mt-8 w-full rounded-xl border border-neutral-700 bg-neutral-800/80 py-2.5 text-xs font-semibold text-white hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                Pay with USDT (TRC20 / ERC20)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 border-t border-neutral-900">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-white">Frequently Asked Questions</h2>
            <p className="mt-2 text-neutral-400 text-sm">Everything you need to know about MakeVidsAI</p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'How does MakeVidsAI generate 30-minute videos?',
                a: 'Rather than calling an AI model with one gigantic 30-minute prompt, MakeVidsAI implements an asynchronous long-video pipeline. It creates an overarching script, separates it into narrative chapters, generates coordinated individual scene clips with persistent characters, synthesizes matching narration and soundtracks, and renders the assembled master video.'
              },
              {
                q: 'What happens if a scene generation fails during a long video?',
                a: 'You never lose your project. Our fault-tolerant job queue automatically retries the failed scene up to 3 times. If it still needs adjustment, only that specific scene is marked for manual retry while all other scenes remain securely preserved.'
              },
              {
                q: 'How does character consistency work?',
                a: 'When you create a video with characters, MakeVidsAI extracts key biometric and visual attributes (hair, face structure, clothing, body proportions, color schemes) into a persistent character reference model, automatically weaving these markers into future scene prompts.'
              },
              {
                q: 'Do I own the commercial rights to videos created on MakeVidsAI?',
                a: 'Yes. All videos rendered on Creator and Pro plans are 100% royalty-free for commercial marketing, social media monetization, broadcast, and client deliverables with no watermarks.'
              }
            ].map((faq, idx) => (
              <div key={idx} className="rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-5">
                <h4 className="text-sm font-semibold text-white mb-2">{faq.q}</h4>
                <p className="text-xs text-neutral-400 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 border-t border-neutral-900 bg-gradient-to-b from-transparent to-indigo-950/20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Start creating videos today
          </h2>
          <p className="mt-4 text-neutral-300 text-sm sm:text-base max-w-xl mx-auto">
            Experience the simplicity of AI video generation. No editing experience needed.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => onQuickGenerate(defaultPlaceholder)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Generate Your First Video
            </button>
            <button
              onClick={onExploreTemplates}
              className="rounded-xl border border-neutral-700 bg-neutral-800/80 px-6 py-3 text-sm font-semibold text-neutral-200 hover:bg-neutral-800 transition-all cursor-pointer"
            >
              Browse Templates
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-12 text-xs text-neutral-500">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-600 text-white font-bold text-[10px]">
              MV
            </div>
            <span className="font-semibold text-neutral-300">MakeVidsAI</span>
            <span aria-hidden="true">·</span>
            <span>Your idea. One prompt. One video.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-neutral-300">Features</a>
            <a href="#long-video" className="hover:text-neutral-300">Long Video</a>
            <a href="#pricing" className="hover:text-neutral-300">Pricing</a>
            <a href="#faq" className="hover:text-neutral-300">FAQ</a>
            <span>© 2026 MakeVidsAI. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
