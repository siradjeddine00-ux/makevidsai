import React, { useState } from 'react';
import { 
  Search, 
  Play, 
  Trash2, 
  Download, 
  Clock, 
  Sparkles, 
  Film, 
  Layers, 
  Filter, 
  AlertCircle,
  Eye
} from 'lucide-react';
import { VideoProject } from '../types';

interface MyVideosViewProps {
  projects: VideoProject[];
  onSelectProject: (project: VideoProject) => void;
  onOpenCreator: () => void;
  onDeleteProject: (projectId: string) => void;
}

export const MyVideosView: React.FC<MyVideosViewProps> = ({
  projects,
  onSelectProject,
  onOpenCreator,
  onDeleteProject
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'processing' | 'failed'>('all');

  const filteredProjects = projects.filter((project) => {
    if (statusFilter !== 'all' && project.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return project.title.toLowerCase().includes(q) || project.rawPrompt.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">My Videos</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Browse, manage, and download all your AI-generated video projects.
          </p>
        </div>

        <button
          onClick={onOpenCreator}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          + New Video
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        {/* Status segmented tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-900 rounded-xl border border-neutral-800 text-xs w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Videos' },
            { id: 'completed', label: 'Completed' },
            { id: 'processing', label: 'Processing' },
            { id: 'failed', label: 'Failed' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by prompt or title..."
            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pl-9 pr-3 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-12 text-center my-8 max-w-lg mx-auto">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mx-auto mb-4">
            <Film className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No videos yet</h3>
          <p className="text-xs text-neutral-400 mt-1 mb-5">
            Turn your ideas, scripts, and concepts into professional videos in minutes.
          </p>
          <button
            onClick={onOpenCreator}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Sparkles className="h-4 w-4" />
            Create Video ✨
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map((project) => {
            const dateStr = new Date(project.createdAt).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric'
            });

            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className="group rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden hover:border-neutral-700 transition-all hover:-translate-y-1 shadow-md hover:shadow-xl hover:shadow-black/40 flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* Thumbnail container */}
                  <div className="relative aspect-video w-full overflow-hidden bg-neutral-950">
                    <img
                      src={project.thumbnailUrl || '/src/assets/images/hero_sample_cinematic_1790906701150.jpg'}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Status badge in top right */}
                    <div className="absolute top-2 right-2">
                      {project.status === 'completed' ? (
                        <span className="rounded bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-emerald-400 border border-emerald-500/20">
                          Ready
                        </span>
                      ) : project.status === 'processing' ? (
                        <span className="rounded bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-indigo-400 border border-indigo-500/20">
                          {project.progressPercentage}%
                        </span>
                      ) : (
                        <span className="rounded bg-black/70 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-mono text-rose-400 border border-rose-500/20">
                          Failed
                        </span>
                      )}
                    </div>

                    {/* Duration badge */}
                    <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-[10px] font-mono text-neutral-300">
                      {project.duration}
                    </div>

                    {/* Hover Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-neutral-950 shadow-lg">
                        <Play className="h-4 w-4 fill-neutral-950 ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mb-1">
                      <span className="capitalize">{project.style}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.scenes.length} Scenes</span>
                      <span aria-hidden="true">·</span>
                      <span>{dateStr}</span>
                    </div>

                    <h3 className="font-semibold text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {project.title}
                    </h3>
                    <p className="mt-1 text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {project.rawPrompt}
                    </p>
                  </div>
                </div>

                {/* Footer action bar */}
                <div className="p-3 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400">
                  <span className="text-[11px] text-neutral-500">{project.aspectRatio}</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectProject(project);
                      }}
                      className="hover:text-white p-1 cursor-pointer"
                      title="Open Video"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteProject(project.id);
                      }}
                      className="hover:text-rose-400 p-1 cursor-pointer"
                      title="Delete Video"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
