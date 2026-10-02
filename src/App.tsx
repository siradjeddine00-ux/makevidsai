import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { DashboardHomeView } from './components/DashboardHomeView';
import { MyVideosView } from './components/MyVideosView';
import { TemplatesView } from './components/TemplatesView';
import { VideoCreatorModal } from './components/VideoCreatorModal';
import { GenerationProgressModal } from './components/GenerationProgressModal';
import { VideoPlayerView } from './components/VideoPlayerView';
import { VideoEditorView } from './components/VideoEditorView';
import { BillingModal } from './components/BillingModal';
import { AdminDashboard } from './components/AdminDashboard';
import { ShareVideoModal } from './components/ShareVideoModal';
import { generateSceneWithPuter } from './services/ai/videoWorker';
import { 
  UserProfile, 
  VideoProject, 
  VideoTemplate, 
  UserRole, 
  CreationMode, 
  VideoDuration, 
  VideoStyle 
} from './types';

export function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<VideoProject[]>([]);
  const [templates, setTemplates] = useState<VideoTemplate[]>([]);
  
  // Navigation
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedProject, setSelectedProject] = useState<VideoProject | null>(null);
  const [isEditorMode, setIsEditorMode] = useState<boolean>(false);

  // Modals
  const [isCreatorOpen, setIsCreatorOpen] = useState(false);
  const [creatorInitialPrompt, setCreatorInitialPrompt] = useState('');
  const [creatorInitialMode, setCreatorInitialMode] = useState<CreationMode>('text');
  const [creatorInitialDuration, setCreatorInitialDuration] = useState<VideoDuration>('30s');
  const [creatorInitialStyle, setCreatorInitialStyle] = useState<VideoStyle>('cinematic');

  const [activeGeneratingProject, setActiveGeneratingProject] = useState<VideoProject | null>(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);

  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareTargetProject, setShareTargetProject] = useState<VideoProject | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initial load
  useEffect(() => {
    loadUser();
    loadProjects();
    loadTemplates();

    // Check URL params for share link
    const params = new URLSearchParams(window.location.search);
    const shareId = params.get('share');
    if (shareId) {
      loadPublicProject(shareId);
    }
  }, []);

  // Poll active generation project while processing
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (activeGeneratingProject && (activeGeneratingProject.status === 'processing' || activeGeneratingProject.status === 'queued')) {
      timer = setInterval(async () => {
        try {
          const res = await fetch(`/api/projects/${activeGeneratingProject.id}`);
          const data = await res.json();
          if (res.ok && data.project) {
            setActiveGeneratingProject(data.project);
            // Also sync in main projects list
            setProjects(prev => prev.map(p => p.id === data.project.id ? data.project : p));
            if (data.project.status === 'completed') {
              showToast(`Video "${data.project.title}" generation completed!`);
              loadUser(); // Refresh credits
            }
          }
        } catch (err) {
          console.error(err);
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeGeneratingProject]);

  const loadUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    }
  };

  const loadProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (res.ok && data.projects) {
        setProjects(data.projects);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await fetch('/api/billing/templates');
      const data = await res.json();
      if (res.ok && data.templates) {
        setTemplates(data.templates);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    }
  };

  const loadPublicProject = async (shareId: string) => {
    try {
      const res = await fetch(`/api/projects/public/${shareId}`);
      const data = await res.json();
      if (res.ok && data.project) {
        setSelectedProject(data.project);
        setCurrentTab('player');
      }
    } catch (err) {
      console.error('Error fetching public video:', err);
    }
  };

  // Role Switcher for Testing (Section 21, 28)
  const handleSwitchRole = async (role: UserRole) => {
    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setCurrentUser(data.user);
        loadProjects();
        showToast(`Switched persona to ${data.user.name} (${role})`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Video Generation
  const handleCreateVideoSubmit = async (params: any) => {
    setIsCreatorOpen(false);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || 'Failed to start video generation');
        return;
      }

      // Add to projects list
      setProjects(prev => [data.project, ...prev]);
      setActiveGeneratingProject(data.project);
      setIsProgressModalOpen(true);
      loadUser(); // Update credit count

      // Asynchronously trigger Puter.js scene video generation
      setTimeout(async () => {
        try {
          const proj = data.project;
          if (proj && proj.scenes) {
            for (const sc of proj.scenes) {
              await generateSceneWithPuter(proj.id, sc, proj.style);
            }
          }
        } catch (e) {
          console.warn('[Puter Pipeline] Scene generation note:', e);
        }
      }, 400);
    } catch (err: any) {
      showToast(err.message || 'Error communicating with generation engine');
    }
  };

  // Scene Retry (Section 6 & 30) - using Puter.js
  const handleRetryScene = async (sceneId: string) => {
    if (!activeGeneratingProject && !selectedProject) return;
    const targetProject = activeGeneratingProject || selectedProject;
    if (!targetProject) return;

    const targetScene = targetProject.scenes.find(s => s.id === sceneId);
    if (!targetScene) return;

    showToast(`Retrying Scene ${targetScene.sceneNumber} via Puter.js...`);

    try {
      // 1. Run Puter.js scene video generator
      const puterResult = await generateSceneWithPuter(
        targetProject.id,
        targetScene,
        targetProject.style,
        (msg) => showToast(msg)
      );

      // 2. Synchronize with backend retry endpoint
      const res = await fetch(`/api/projects/${targetProject.id}/scenes/${sceneId}/retry`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok && data.project) {
        if (puterResult.success && puterResult.mediaUrl) {
          const sc = data.project.scenes.find((s: any) => s.id === sceneId);
          if (sc) {
            sc.mediaUrl = puterResult.mediaUrl;
            sc.thumbnailUrl = puterResult.thumbnailUrl;
          }
        }
        if (activeGeneratingProject) setActiveGeneratingProject(data.project);
        if (selectedProject) setSelectedProject(data.project);
        setProjects(prev => prev.map(p => p.id === data.project.id ? data.project : p));
        showToast(`Scene ${targetScene.sceneNumber} regenerated via Puter.js.`);
      }
    } catch (err: any) {
      console.error(err);
      showToast('Scene retry failed. You can attempt again.');
    }
  };

  // Delete Project
  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== projectId));
        if (selectedProject?.id === projectId) setSelectedProject(null);
        showToast('Project deleted.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Use Template action (Section 14 & 42)
  const handleUseTemplate = (template: VideoTemplate) => {
    setCreatorInitialPrompt(template.promptPlaceholder);
    setCreatorInitialDuration(template.suggestedDuration);
    setCreatorInitialStyle(template.suggestedStyle);
    setCreatorInitialMode('template');
    setIsCreatorOpen(true);
  };

  // Share toggle
  const handleToggleShare = async (isPublic: boolean) => {
    if (!shareTargetProject) return;
    try {
      const res = await fetch(`/api/projects/${shareTargetProject.id}/share-toggle`, {
        method: 'POST'
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...shareTargetProject, isPublicShare: data.isPublicShare, shareId: data.shareId };
        setShareTargetProject(updated);
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
        if (selectedProject?.id === updated.id) setSelectedProject(updated);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 rounded-xl border border-indigo-500/40 bg-neutral-900/95 px-4 py-3 text-xs font-semibold text-white shadow-2xl shadow-black/80 backdrop-blur-md animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* 3-Zone Navigation Header */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setSelectedProject(null);
          setIsEditorMode(false);
          setCurrentTab(tab);
        }}
        currentUser={currentUser}
        onOpenCreator={() => {
          setCreatorInitialPrompt('');
          setCreatorInitialMode('text');
          setIsCreatorOpen(true);
        }}
        onSwitchRole={handleSwitchRole}
        onOpenBilling={() => setIsBillingOpen(true)}
        isLanding={currentTab === 'landing'}
        onGoHome={() => {
          setSelectedProject(null);
          setIsEditorMode(false);
          setCurrentTab('landing');
        }}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {selectedProject ? (
          isEditorMode ? (
            <VideoEditorView
              project={selectedProject}
              onBack={() => setIsEditorMode(false)}
              onUpdateProject={(updated) => {
                setSelectedProject(updated);
                setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
              }}
              onRetryScene={handleRetryScene}
            />
          ) : (
            <VideoPlayerView
              project={selectedProject}
              onBack={() => setSelectedProject(null)}
              onOpenEditor={() => setIsEditorMode(true)}
              onShare={() => {
                setShareTargetProject(selectedProject);
                setIsShareModalOpen(true);
              }}
              onCreateAnother={() => {
                setSelectedProject(null);
                setIsCreatorOpen(true);
              }}
              onRegenerate={() => {
                handleCreateVideoSubmit({
                  prompt: selectedProject.rawPrompt,
                  creationMode: selectedProject.creationMode,
                  aspectRatio: selectedProject.aspectRatio,
                  duration: selectedProject.duration,
                  generationMode: selectedProject.generationMode,
                  style: selectedProject.style,
                  voice: selectedProject.voice,
                  voiceLanguage: selectedProject.voiceLanguage,
                  music: selectedProject.music,
                  subtitles: selectedProject.subtitles,
                  subtitleStyle: selectedProject.subtitleStyle
                });
              }}
            />
          )
        ) : currentTab === 'landing' ? (
          <LandingPage
            onQuickGenerate={(promptText, options) => {
              handleCreateVideoSubmit({
                prompt: promptText,
                creationMode: options?.creationMode || 'text',
                aspectRatio: options?.aspectRatio || '16:9',
                duration: options?.duration || '30s',
                generationMode: 'fast',
                style: 'cinematic',
                voice: options?.voice || 'ai_voice',
                voiceLanguage: 'English',
                music: options?.music || 'ai_music',
                musicMood: 'Cinematic Ambient',
                subtitles: 'auto',
                subtitleStyle: 'bold_social'
              });
            }}
            onExploreTemplates={() => setCurrentTab('templates')}
            onOpenPricing={() => setIsBillingOpen(true)}
            onPreviewSampleVideo={(sampleId) => {
              const p = projects.find(item => item.id === sampleId) || projects[0];
              if (p) setSelectedProject(p);
            }}
          />
        ) : currentTab === 'dashboard' ? (
          <DashboardHomeView
            currentUser={currentUser}
            projects={projects}
            onOpenCreator={(mode, prompt) => {
              if (prompt) setCreatorInitialPrompt(prompt);
              if (mode) setCreatorInitialMode(mode);
              setIsCreatorOpen(true);
            }}
            onSelectProject={(p) => setSelectedProject(p)}
            onExploreTemplates={() => setCurrentTab('templates')}
          />
        ) : currentTab === 'my-videos' ? (
          <MyVideosView
            projects={projects}
            onSelectProject={(p) => setSelectedProject(p)}
            onOpenCreator={() => setIsCreatorOpen(true)}
            onDeleteProject={handleDeleteProject}
          />
        ) : currentTab === 'templates' ? (
          <TemplatesView
            templates={templates}
            onUseTemplate={handleUseTemplate}
          />
        ) : currentTab === 'admin' ? (
          <AdminDashboard
            currentUser={currentUser}
            onClose={() => setCurrentTab('dashboard')}
          />
        ) : null}
      </main>

      {/* Video Creator Modal */}
      <VideoCreatorModal
        isOpen={isCreatorOpen}
        onClose={() => setIsCreatorOpen(false)}
        currentUser={currentUser}
        onSubmit={handleCreateVideoSubmit}
        initialPrompt={creatorInitialPrompt}
        initialMode={creatorInitialMode}
        initialDuration={creatorInitialDuration}
        initialStyle={creatorInitialStyle}
      />

      {/* Generation Pipeline Progress Modal */}
      <GenerationProgressModal
        project={activeGeneratingProject}
        onViewProject={(p) => {
          setIsProgressModalOpen(false);
          setActiveGeneratingProject(null);
          setSelectedProject(p);
        }}
        onRetryScene={handleRetryScene}
        onDismiss={() => {
          setIsProgressModalOpen(false);
          showToast('Video generation running in background.');
        }}
      />

      {/* Billing & Subscriptions Modal */}
      <BillingModal
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        currentUser={currentUser}
        onPlanChanged={(updated) => {
          setCurrentUser(updated);
          showToast(`Subscription plan updated to ${updated.subscriptionPlan}!`);
        }}
      />

      {/* Public Share Modal */}
      <ShareVideoModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        project={shareTargetProject}
        onToggleShare={handleToggleShare}
      />
    </div>
  );
}
export default App;
