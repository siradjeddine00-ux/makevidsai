import React from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  RotateCw, 
  Film, 
  Mic, 
  Music, 
  Subtitles, 
  AlertCircle, 
  Eye, 
  ArrowRight 
} from 'lucide-react';
import { VideoProject } from '../types';

interface GenerationProgressModalProps {
  project: VideoProject | null;
  onViewProject: (project: VideoProject) => void;
  onRetryScene: (sceneId: string) => void;
  onDismiss: () => void;
}

export const GenerationProgressModal: React.FC<GenerationProgressModalProps> = ({
  project,
  onViewProject,
  onRetryScene,
  onDismiss,
}) => {
  if (!project || project.status === 'draft') return null;

  const steps = [
    { key: 'script', label: 'Creating script & creative brief', icon: Film, threshold: 20 },
    { key: 'scenes', label: 'Planning chapters & generating scenes', icon: Sparkles, threshold: 70 },
    { key: 'voice', label: 'Synthesizing AI voiceover', icon: Mic, threshold: 80 },
    { key: 'music', label: 'Scoring music & sound effects', icon: Music, threshold: 90 },
    { key: 'subtitles', label: 'Generating auto subtitles', icon: Subtitles, threshold: 95 },
    { key: 'rendering', label: 'Rendering final video & QC validation', icon: CheckCircle2, threshold: 100 }
  ];

  const totalScenes = project.scenes.length;
  const completedScenes = project.scenes.filter(s => s.status === 'completed').length;
  const failedScenes = project.scenes.filter(s => s.status === 'failed');

  const isCompleted = project.status === 'completed';
  const isFailed = project.status === 'failed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3">
            {isCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            ) : isFailed ? (
              <AlertCircle className="h-6 w-6 text-rose-400" />
            ) : (
              <RotateCw className="h-6 w-6 animate-spin text-indigo-400" />
            )}
          </div>

          <h3 className="text-xl font-bold text-white">
            {isCompleted
              ? 'Your video is ready!'
              : isFailed
              ? 'Generation encountered an issue'
              : 'Creating your video...'}
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-md mx-auto line-clamp-1">
            "{project.title || project.rawPrompt}"
          </p>
        </div>

        {/* Big Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-neutral-300 mb-2">
            <span className="font-medium">{project.currentStepMessage}</span>
            <span className="font-mono font-bold text-indigo-400 tabular-nums">
              {project.progressPercentage}%
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-neutral-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                isCompleted
                  ? 'bg-emerald-500'
                  : isFailed
                  ? 'bg-rose-500'
                  : 'bg-gradient-to-r from-indigo-500 via-indigo-400 to-violet-500'
              }`}
              style={{ width: `${project.progressPercentage}%` }}
            />
          </div>

          {/* Scene counter metric (Scene X / Y) */}
          {totalScenes > 0 && !isCompleted && (
            <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 border border-neutral-800/80 bg-neutral-950/40 rounded-lg px-3 py-2">
              <span>Scene Generation Pipeline</span>
              <span className="font-mono text-indigo-300 font-semibold">
                Scene {completedScenes} / {totalScenes}
              </span>
            </div>
          )}
        </div>

        {/* Multi-Step Pipeline List */}
        <div className="space-y-2 mb-6 max-h-56 overflow-y-auto pr-1">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isStepDone = project.progressPercentage >= step.threshold;
            const isCurrentStep = 
              project.progressPercentage < step.threshold &&
              (idx === 0 || project.progressPercentage >= steps[idx - 1].threshold);

            return (
              <div
                key={step.key}
                className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-colors ${
                  isStepDone
                    ? 'border-neutral-800/80 bg-neutral-950/40 text-neutral-300'
                    : isCurrentStep
                    ? 'border-indigo-500/40 bg-indigo-500/5 text-white'
                    : 'border-transparent text-neutral-500'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`h-4 w-4 ${
                      isStepDone
                        ? 'text-emerald-400'
                        : isCurrentStep
                        ? 'text-indigo-400 animate-pulse'
                        : 'text-neutral-600'
                    }`}
                  />
                  <span>{step.label}</span>
                </div>
                <div>
                  {isStepDone ? (
                    <span className="text-emerald-400 font-medium text-[11px]">Completed</span>
                  ) : isCurrentStep ? (
                    <span className="text-indigo-400 font-mono text-[11px]">Processing...</span>
                  ) : (
                    <span className="text-neutral-600 text-[11px]">Queued</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Failed scenes notice with individual retry (Section 6 & 30) */}
        {failedScenes.length > 0 && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 mb-5 text-xs">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="font-semibold text-rose-300">
                  {failedScenes.length} Scene needs attention
                </h4>
                <p className="text-neutral-300 text-[11px] mt-0.5">
                  The system isolated the issue. You can retry this scene individually without losing other progress.
                </p>
              </div>
              <button
                onClick={() => onRetryScene(failedScenes[0].id)}
                className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500 transition-colors whitespace-nowrap cursor-pointer"
              >
                Retry Scene
              </button>
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between border-t border-neutral-800/80 pt-4">
          <p className="text-[11px] text-neutral-500">
            {isCompleted
              ? 'Quality control verified. All audio and visual tracks synchronized.'
              : 'You can leave this page anytime. Your video continues generating in the background.'}
          </p>

          <div className="flex items-center gap-2">
            {isCompleted ? (
              <button
                onClick={() => onViewProject(project)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 cursor-pointer"
              >
                <Eye className="h-3.5 w-3.5" />
                Watch Video
              </button>
            ) : (
              <button
                onClick={onDismiss}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-medium text-neutral-300 hover:bg-neutral-800 cursor-pointer"
              >
                Continue in Background
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
