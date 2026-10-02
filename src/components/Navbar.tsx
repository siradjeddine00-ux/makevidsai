import React from 'react';
import { Sparkles, Video, Play, Zap, Shield, User, LogOut, ChevronDown } from 'lucide-react';
import { UserProfile, UserRole } from '../types';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserProfile | null;
  onOpenCreator: () => void;
  onSwitchRole: (role: UserRole) => void;
  onOpenBilling: () => void;
  isLanding: boolean;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onOpenCreator,
  onSwitchRole,
  onOpenBilling,
  isLanding,
  onGoHome,
}) => {
  const [roleMenuOpen, setRoleMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-800/80 bg-neutral-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-6">
          <button 
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left transition-opacity hover:opacity-90"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20">
              <Play className="h-4 w-4 fill-white text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-white">
                MakeVids<span className="text-indigo-400">AI</span>
              </span>
            </div>
          </button>

          {/* Quick role test indicator (non-pill text) */}
          {currentUser && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-neutral-400">
              <span className="text-neutral-500">Mode:</span>
              <span className="font-medium capitalize text-neutral-200">{currentUser.role}</span>
              <span aria-hidden="true" className="text-neutral-600">·</span>
              <span className="capitalize text-neutral-300">{currentUser.subscriptionPlan} Plan</span>
            </div>
          )}
        </div>

        {/* Zone 2: Navigation Links (Text with hover underlines) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          {isLanding ? (
            <>
              <button 
                onClick={() => onSelectTab('features')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Features
              </button>
              <button 
                onClick={() => onSelectTab('templates')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Templates
              </button>
              <button 
                onClick={() => onSelectTab('long-video')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Long Video (30m)
              </button>
              <button 
                onClick={() => onSelectTab('pricing')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button 
                onClick={() => onSelectTab('faq')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                FAQ
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onSelectTab('dashboard')}
                className={`transition-colors cursor-pointer ${
                  currentTab === 'dashboard' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Studio Home
              </button>
              <button
                onClick={() => onSelectTab('my-videos')}
                className={`transition-colors cursor-pointer ${
                  currentTab === 'my-videos' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                My Videos
              </button>
              <button
                onClick={() => onSelectTab('templates')}
                className={`transition-colors cursor-pointer ${
                  currentTab === 'templates' ? 'text-white font-semibold' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Templates
              </button>
              {(currentUser?.role === 'admin' || currentUser?.role === 'founder') && (
                <button
                  onClick={() => onSelectTab('admin')}
                  className={`flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentTab === 'admin' ? 'text-amber-400 font-semibold' : 'text-neutral-400 hover:text-amber-300'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Founder Panel
                </button>
              )}
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions & Account */}
        <div className="flex items-center gap-3">
          {currentUser && (
            <button
              onClick={onOpenBilling}
              title="Click to view subscription & credit ledger"
              className="flex items-center gap-2 rounded-md border border-neutral-800 bg-neutral-900/80 px-3 py-1.5 text-xs text-neutral-300 hover:border-neutral-700 hover:bg-neutral-800 transition-colors"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span className="font-semibold text-white tabular-nums">{currentUser.credits}</span>
              <span className="text-neutral-400">Credits</span>
            </button>
          )}

          <button
            onClick={onOpenCreator}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all whitespace-nowrap cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
            + New Video
          </button>

          {/* User / Role Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 p-1.5 text-neutral-300 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
              title="Account & Role Switcher"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-800 text-xs font-semibold text-neutral-200">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-neutral-800 bg-neutral-900 p-2 shadow-xl z-50">
                <div className="border-b border-neutral-800 pb-2 mb-2 px-2">
                  <p className="text-xs font-semibold text-white">{currentUser?.name}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{currentUser?.email}</p>
                </div>

                <div className="space-y-1">
                  <p className="px-2 text-[10px] font-medium text-neutral-400 uppercase tracking-wider">
                    Role Testing Switcher
                  </p>
                  <button
                    onClick={() => {
                      onSwitchRole('founder');
                      setRoleMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-left cursor-pointer ${
                      currentUser?.role === 'founder'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span>Alex Rivera (Founder)</span>
                    <span className="text-[10px] text-neutral-400">Full Access</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchRole('creator');
                      setRoleMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-left cursor-pointer ${
                      currentUser?.role === 'creator'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span>Sarah Chen (Creator)</span>
                    <span className="text-[10px] text-neutral-400">Creator Plan</span>
                  </button>
                  <button
                    onClick={() => {
                      onSwitchRole('user');
                      setRoleMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-left cursor-pointer ${
                      currentUser?.role === 'user'
                        ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                        : 'text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    <span>David Miller (Free User)</span>
                    <span className="text-[10px] text-neutral-400">50 Credits</span>
                  </button>
                </div>

                <div className="border-t border-neutral-800 mt-2 pt-2">
                  <button
                    onClick={() => {
                      onOpenBilling();
                      setRoleMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800 cursor-pointer"
                  >
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    Subscription & Credits
                  </button>
                  {isLanding ? (
                    <button
                      onClick={() => {
                        onSelectTab('dashboard');
                        setRoleMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-indigo-400 hover:bg-neutral-800 cursor-pointer"
                    >
                      <Video className="h-3.5 w-3.5" />
                      Open Creator Studio
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onGoHome();
                        setRoleMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800 cursor-pointer"
                    >
                      View Landing Page
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
