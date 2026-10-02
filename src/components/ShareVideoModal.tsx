import React, { useState } from 'react';
import { X, Copy, Check, Globe, Lock, Share2 } from 'lucide-react';
import { VideoProject } from '../types';

interface ShareVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: VideoProject | null;
  onToggleShare: (isPublic: boolean) => void;
}

export const ShareVideoModal: React.FC<ShareVideoModalProps> = ({
  isOpen,
  onClose,
  project,
  onToggleShare
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !project) return null;

  const shareUrl = `${window.location.origin}/?share=${project.shareId || project.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Share Video</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 hover:text-white hover:bg-neutral-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-semibold text-white truncate">{project.title}</h4>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Anyone with this link will be able to watch your video without signing in.
            </p>
          </div>

          {/* Toggle Access */}
          <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              {project.isPublicShare ? (
                <Globe className="h-4 w-4 text-emerald-400" />
              ) : (
                <Lock className="h-4 w-4 text-neutral-500" />
              )}
              <div>
                <span className="font-semibold text-neutral-200 block">
                  {project.isPublicShare ? 'Public Link Enabled' : 'Link Sharing Disabled'}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {project.isPublicShare ? 'Publicly accessible via URL' : 'Only you can view this project'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onToggleShare(!project.isPublicShare)}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition-colors cursor-pointer ${
                project.isPublicShare
                  ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                  : 'bg-indigo-600 text-white hover:bg-indigo-500'
              }`}
            >
              {project.isPublicShare ? 'Disable' : 'Enable Link'}
            </button>
          </div>

          {/* Copy Box */}
          {project.isPublicShare && (
            <div>
              <label className="block text-[11px] text-neutral-400 mb-1">Shareable Link</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
