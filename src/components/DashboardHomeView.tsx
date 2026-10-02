import React, { useState } from 'react';
import { 
  Sparkles, 
  Upload, 
  FileText, 
  ShoppingBag, 
  BookOpen, 
  ArrowRight, 
  Clock, 
  Play, 
  Layers, 
  Plus 
} from 'lucide-react';
import { VideoProject, UserProfile, CreationMode } from '../types';

interface DashboardHomeViewProps {
  currentUser: UserProfile | null;
  projects: VideoProject[];
  onOpenCreator: (initialMode?: CreationMode, initialPrompt?: string) => void;
  onSelectProject: (project: VideoProject) => void;
  onExploreTemplates: () => void;
}

export const DashboardHomeView: React.FC<DashboardHomeViewProps> = ({
  currentUser,
  projects,
  onOpenCreator,
  onSelectProject,
  onExploreTemplates
}) => {
  const [prompt, setPrompt] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onOpenCreator('text', prompt.trim());
    } else {
      onOpenCreator('text');
    }
  };

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Welcome & Prompt Box */}
      <div className="rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-900/90 to-neutral-950 p-6 sm:p-8 shadow-xl mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
          What do you want to create today?
        </h1>
        <p className="text-xs sm:text-sm text-neutral-400 mb-6">
          Enter an idea or choose a creation method to generate your video automatically.
        </p>

        {/* Big Prompt Input */}
        <form onSubmit={handleQuickSubmit} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A 3-minute documentary about deep sea bioluminescent creatures..."
              className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-100 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4" />
              Generate Video ✨
            </button>
          </div>
        </form>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            {
              id: 'text',
              title: 'Text to Video',
              desc: 'One prompt to video',
              icon: Sparkles
            },
            {
              id: 'image',
              title: 'Image to Video',
              desc: 'Animate a still photo',
              icon: Upload
            },
            {
              id: 'script',
              title: 'Script to Video',
              desc: 'Auto-divide screenplay',
              icon: FileText
            },
            {
              id: 'ad',
              title: 'AI Product Ad',
              desc: 'High-converting promo',
              icon: ShoppingBag
            },
            {
              id: 'story',
              title: 'Story to Video',
              desc: 'Deep multi-chapter lore',
              icon: BookOpen
            }
          ].map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onOpenCreator(action.id as CreationMode)}
                className="flex flex-col items-start p-3.5 rounded-xl border border-neutral-800/80 bg-neutral-900/60 hover:bg-neutral-800/60 hover:border-neutral-700 transition-all text-left cursor-pointer group"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 mb-2 group-hover:bg-indigo-500/20">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {action.title}
                </span>
                <span className="text-[11px] text-neutral-500 mt-0.5 line-clamp-1">
                  {action.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Projects Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="h-4 w-4 text-neutral-400" />
            Recent Projects
          </h2>
          {projects.length > 0 && (
            <button
              onClick={() => onOpenCreator()}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              + Create Another
            </button>
          )}
        </div>

        {recentProjects.length === 0 ? (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-8 text-center">
            <p className="text-xs text-neutral-400 mb-3">You don't have any recent video projects yet.</p>
            <button
              onClick={() => onOpenCreator()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Your First Video
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentProjects.map((p) => (
              <div
                key={p.id}
                onClick={() => onSelectProject(p)}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all hover:-translate-y-1 shadow-md cursor-pointer"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                  <img
                    src={p.thumbnailUrl || '/src/assets/images/hero_sample_cinematic_1790906701150.jpg'}
                    alt={p.title}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                    {p.duration}
                  </div>
                </div>

                <div className="p-3.5">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 mb-1">
                    <span className="capitalize">{p.style}</span>
                    <span aria-hidden="true">·</span>
                    <span>{p.scenes.length} Scenes</span>
                  </div>
                  <h3 className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors truncate">
                    {p.title}
                  </h3>
                  <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                    {p.rawPrompt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
