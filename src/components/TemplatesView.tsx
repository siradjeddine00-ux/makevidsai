import React, { useState } from 'react';
import { Sparkles, ArrowRight, Play, Film } from 'lucide-react';
import { VideoTemplate } from '../types';

interface TemplatesViewProps {
  templates: VideoTemplate[];
  onUseTemplate: (template: VideoTemplate) => void;
}

export const TemplatesView: React.FC<TemplatesViewProps> = ({
  templates,
  onUseTemplate
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = [
    'All',
    'Cinematic',
    'Documentary',
    'Advertisement',
    'Anime',
    'TikTok',
    'Education',
    'Story',
    'Gaming',
    'Motivational',
    'News'
  ];

  const filtered = selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-white">AI Video Templates</h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-400">
          Jumpstart your creation with pre-calibrated scene pacing, visual aesthetics, and sound presets.
        </p>

        {/* Categories Bar */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mt-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((tmpl) => (
          <div
            key={tmpl.id}
            className="group rounded-2xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-black/50 flex flex-col justify-between"
          >
            <div>
              {/* Preview Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                <img
                  src={tmpl.previewThumbnailUrl}
                  alt={tmpl.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-black/30" />
                
                <div className="absolute top-2.5 left-2.5 rounded bg-black/60 backdrop-blur-md px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-white/10">
                  {tmpl.category}
                </div>

                <div className="absolute bottom-2.5 right-2.5 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                  {tmpl.suggestedDuration} · {tmpl.suggestedAspectRatio}
                </div>
              </div>

              {/* Information */}
              <div className="p-5">
                <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">
                  {tmpl.title}
                </h3>
                <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed">
                  {tmpl.description}
                </p>

                {/* Example prompt preview */}
                <div className="mt-3 rounded-lg bg-neutral-950/60 border border-neutral-800/80 p-2.5 text-[11px] text-neutral-400 italic">
                  "{tmpl.promptPlaceholder}"
                </div>
              </div>
            </div>

            {/* Bottom action */}
            <div className="p-5 pt-0">
              <button
                onClick={() => onUseTemplate(tmpl)}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 py-2.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
