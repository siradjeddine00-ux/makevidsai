import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Download, 
  Share2, 
  Edit3, 
  Sparkles, 
  Subtitles, 
  Maximize2, 
  Check, 
  Clock, 
  Layers, 
  ArrowLeft 
} from 'lucide-react';
import { VideoProject, VideoScene } from '../types';

interface VideoPlayerViewProps {
  project: VideoProject;
  onBack: () => void;
  onOpenEditor: () => void;
  onShare: () => void;
  onCreateAnother: () => void;
  onRegenerate: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  project,
  onBack,
  onOpenEditor,
  onShare,
  onCreateAnother,
  onRegenerate
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(project.subtitles !== 'off');
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState(false);

  const totalDurationSeconds = project.scenes.reduce((acc, s) => acc + s.durationSeconds, 0) || 30;

  // Determine current scene from currentTime
  useEffect(() => {
    let accumulated = 0;
    for (let i = 0; i < project.scenes.length; i++) {
      accumulated += project.scenes[i].durationSeconds;
      if (currentTime <= accumulated) {
        setActiveSceneIndex(i);
        break;
      }
    }
  }, [currentTime, project.scenes]);

  const currentScene = project.scenes[activeSceneIndex] || project.scenes[0];

  // Direct mounting into the #video-preview container as required by Puter.js specification
  useEffect(() => {
    const container = document.getElementById('video-preview');
    if (!container) return;

    container.innerHTML = '';

    if (currentScene?.mediaUrl) {
      const video = document.createElement('video');
      video.src = currentScene.mediaUrl;
      video.controls = true;
      video.playsInline = true;
      video.preload = 'metadata';
      video.className = 'w-full h-full object-contain';
      video.muted = isMuted;

      video.ontimeupdate = () => {
        let sceneStart = 0;
        for (let i = 0; i < activeSceneIndex; i++) {
          sceneStart += project.scenes[i].durationSeconds;
        }
        setCurrentTime(sceneStart + video.currentTime);
      };

      video.onended = () => {
        if (activeSceneIndex < project.scenes.length - 1) {
          setActiveSceneIndex(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      };

      if (isPlaying) {
        video.play().catch(() => {});
      }

      container.appendChild(video);
    } else {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'w-full h-full flex flex-col items-center justify-center p-8 text-center text-neutral-400 bg-neutral-950';
      emptyDiv.innerHTML = `
        <div class="h-12 w-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-indigo-400 mb-3">
          <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
        </div>
        <p class="font-bold text-white text-sm">Scene ${currentScene?.sceneNumber || 1}: ${currentScene?.title || ''}</p>
        <p class="text-xs text-neutral-400 mt-1 max-w-sm line-clamp-2">${currentScene?.visualPrompt || 'Awaiting generation'}</p>
      `;
      container.appendChild(emptyDiv);
    }
  }, [currentScene?.id, currentScene?.mediaUrl, activeSceneIndex, isPlaying, isMuted]);

  // Handle direct Puter.js audio synthesis into the #audio-preview container
  const handleSynthesizeVoice = async () => {
    if (!currentScene?.narrationText) return;
    setIsSynthesizingVoice(true);
    try {
      if (typeof window !== 'undefined' && window.puter?.ai?.txt2speech) {
        const audio = await window.puter.ai.txt2speech(currentScene.narrationText, {
          language: project.voiceLanguage
        });

        if (!audio) {
          throw new Error('No audio was returned by Puter.');
        }

        audio.controls = true;
        audio.preload = 'metadata';
        audio.className = 'w-full';

        const container = document.getElementById('audio-preview');
        if (!container) {
          throw new Error('Audio preview container not found.');
        }

        container.innerHTML = '';
        container.appendChild(audio);
        audio.play().catch(() => {});
      }
    } catch (err) {
      console.error('[Puter TTS] Audio synthesis note:', err);
    } finally {
      setIsSynthesizingVoice(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handleDownload = () => {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
    // Trigger virtual download of video file
    const element = document.createElement('a');
    element.setAttribute('href', currentScene?.mediaUrl || '#');
    element.setAttribute('download', `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_master.mp4`);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Bar with back action */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={onShare}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-neutral-200 hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5 text-indigo-400" />
            Share Video
          </button>
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-700 transition-colors cursor-pointer"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit Scenes in Studio
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            {downloadSuccess ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Download className="h-3.5 w-3.5" />}
            {downloadSuccess ? 'Downloaded!' : 'Export MP4'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Video Viewport (2 cols on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative rounded-2xl border border-neutral-800 bg-neutral-950 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Aspect ratio frame wrapper */}
            <div
              className={`relative w-full ${
                project.aspectRatio === '9:16'
                  ? 'max-w-[360px] aspect-[9/16]'
                  : project.aspectRatio === '1:1'
                  ? 'max-w-[500px] aspect-square'
                  : 'aspect-video'
              } mx-auto overflow-hidden bg-black flex items-center justify-center`}
            >
              {/* Active Scene Video Frame - Official Puter.js #video-preview container */}
              <div
                id="video-preview"
                className="w-full h-full flex items-center justify-center bg-black overflow-hidden relative"
              />

              {/* Cinematic Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

              {/* Free Plan Watermark (Section 27) */}
              {project.hasWatermark && (
                <div className="absolute bottom-16 right-4 rounded bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-semibold tracking-wider text-white/90 border border-white/10 pointer-events-none shadow-md">
                  MakeVids<span className="text-indigo-400">AI</span> Free
                </div>
              )}

              {/* Dynamic Auto Subtitles Overlay */}
              {showSubtitles && currentScene?.subtitleText && (
                <div className="absolute bottom-16 inset-x-4 text-center pointer-events-none px-4">
                  <span
                    className={`inline-block rounded-lg px-3 py-1 font-bold ${
                      project.subtitleStyle === 'bold_social'
                        ? 'bg-amber-400 text-neutral-950 text-sm sm:text-base tracking-wide uppercase shadow-lg shadow-black/80'
                        : project.subtitleStyle === 'karaoke'
                        ? 'bg-indigo-600/90 text-white text-sm sm:text-base border border-indigo-400/40 shadow-lg'
                        : 'bg-black/75 text-neutral-100 text-xs sm:text-sm font-medium backdrop-blur-sm'
                    }`}
                  >
                    {currentScene.subtitleText}
                  </span>
                </div>
              )}

              {/* Play / Pause Center Overlay on hover or paused */}
              {!isPlaying && (
                <button
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors cursor-pointer"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-2xl hover:scale-105 active:scale-95 transition-transform">
                    <Play className="h-6 w-6 fill-neutral-950 ml-1" />
                  </div>
                </button>
              )}

              {/* Floating Bottom Video Controls Bar */}
              <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/95 to-transparent flex flex-col gap-2">
                {/* Timeline Scrubber */}
                <input
                  type="range"
                  min={0}
                  max={totalDurationSeconds}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-lg bg-neutral-700 accent-indigo-500 cursor-pointer"
                />

                <div className="flex items-center justify-between text-xs text-neutral-300">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="text-white hover:text-indigo-400 cursor-pointer"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
                    </button>
                    <button
                      onClick={() => {
                        setCurrentTime(0);
                        setIsPlaying(true);
                      }}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                    <span className="font-mono text-[11px] tabular-nums text-neutral-400">
                      {formatTime(currentTime)} / {formatTime(totalDurationSeconds)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setShowSubtitles(!showSubtitles)}
                      className={`text-xs px-1.5 py-0.5 rounded cursor-pointer ${
                        showSubtitles ? 'bg-indigo-600 text-white' : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      <Subtitles className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Puter.js Voice & Audio Synthesizer (#audio-preview container) */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-white">Voice & Audio Track (Puter.js TTS)</span>
              </div>
              <button
                type="button"
                onClick={handleSynthesizeVoice}
                disabled={isSynthesizingVoice || !currentScene?.narrationText}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-3.5 w-3.5" />
                {isSynthesizingVoice ? 'Synthesizing...' : 'Synthesize Voice (Puter)'}
              </button>
            </div>
            {currentScene?.narrationText ? (
              <p className="text-xs text-neutral-300 italic mb-3 bg-neutral-950/60 p-2.5 rounded-lg border border-neutral-800/80">
                "{currentScene.narrationText}"
              </p>
            ) : (
              <p className="text-xs text-neutral-500 italic mb-2">No narration text designated for this scene.</p>
            )}
            {/* The official #audio-preview container */}
            <div id="audio-preview" className="w-full" />
          </div>

          {/* Video Metadata & Creative Brief */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
            <h1 className="text-xl font-bold text-white mb-2">{project.title}</h1>
            <p className="text-xs text-neutral-400 leading-relaxed mb-4">{project.rawPrompt}</p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-400 border-t border-neutral-800/80 pt-3">
              <div>
                <span className="text-neutral-500">Duration:</span>{' '}
                <span className="font-medium text-neutral-200">{project.duration}</span>
              </div>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <div>
                <span className="text-neutral-500">Style:</span>{' '}
                <span className="font-medium text-neutral-200 capitalize">{project.style}</span>
              </div>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <div>
                <span className="text-neutral-500">Aspect Ratio:</span>{' '}
                <span className="font-medium text-neutral-200">{project.aspectRatio}</span>
              </div>
              <span aria-hidden="true" className="text-neutral-700">·</span>
              <div>
                <span className="text-neutral-500">Voice:</span>{' '}
                <span className="font-medium text-neutral-200 capitalize">{project.voiceLanguage}</span>
              </div>
            </div>

            {project.creativeBrief && (
              <div className="mt-4 rounded-lg bg-neutral-950/60 border border-neutral-800/80 p-3 text-xs">
                <span className="text-neutral-500 font-medium block text-[10px] uppercase tracking-wider mb-1">
                  Creative Brief Logline
                </span>
                <p className="text-neutral-300 italic">"{project.creativeBrief.logline}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar: Chapters & Scenes Navigation */}
        <div className="space-y-4">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-indigo-400" />
                Scenes ({project.scenes.length})
              </h3>
              <button
                onClick={onOpenEditor}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                Open Studio →
              </button>
            </div>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {project.scenes.map((scene, idx) => {
                const isActive = activeSceneIndex === idx;
                return (
                  <div
                    key={scene.id}
                    onClick={() => {
                      // Jump timeline to this scene's start time
                      let sceneStart = 0;
                      for (let i = 0; i < idx; i++) {
                        sceneStart += project.scenes[i].durationSeconds;
                      }
                      setCurrentTime(sceneStart);
                      setActiveSceneIndex(idx);
                      setIsPlaying(true);
                    }}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-sm'
                        : 'border-neutral-800/80 bg-neutral-950/40 hover:border-neutral-700'
                    }`}
                  >
                    <div className="relative h-14 w-20 shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                      {scene.thumbnailUrl || scene.mediaUrl ? (
                        <img
                          src={scene.thumbnailUrl || scene.mediaUrl}
                          alt={scene.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-neutral-500">
                          <Film className="h-4 w-4 text-indigo-400/70" />
                          <span className="text-[9px] font-mono mt-0.5">S{scene.sceneNumber}</span>
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 text-[9px] font-mono text-neutral-300">
                        {scene.durationSeconds}s
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white truncate text-xs">
                        {scene.sceneNumber}. {scene.title}
                      </p>
                      <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5 leading-snug">
                        {scene.visualPrompt}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Create Another Action */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4 text-center">
            <h4 className="text-xs font-semibold text-white mb-1">Satisfied with the result?</h4>
            <p className="text-[11px] text-neutral-400 mb-3">
              Export to your device or create another concept with one prompt.
            </p>
            <div className="flex gap-2">
              <button
                onClick={onRegenerate}
                className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 py-2 text-xs font-semibold text-neutral-200 hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                Regenerate Video
              </button>
              <button
                onClick={onCreateAnother}
                className="flex-1 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                + New Idea
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
