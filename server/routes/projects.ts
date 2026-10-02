import { Router, Request, Response } from 'express';
import { db } from '../db';
import { getCurrentUserId } from './auth';
import { calculateCreditCost, jobQueue } from '../job-queue';
import { editSceneWithAI } from '../ai-orchestrator';
import { 
  VideoProject, 
  CreationMode, 
  VideoAspectRatio, 
  VideoDuration, 
  VideoGenerationMode, 
  VideoStyle, 
  VoiceOption, 
  MusicOption, 
  SubtitleOption,
  VideoScene
} from '../../src/types';

export const projectsRouter = Router();

// List all user's projects
projectsRouter.get('/', (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const statusFilter = req.query.status as string;
  const searchQuery = (req.query.search as string || '').toLowerCase();

  const userProjects: VideoProject[] = [];
  for (const project of db.projects.values()) {
    if (project.userId === userId || userId === 'usr_founder_01') {
      if (statusFilter && statusFilter !== 'all' && project.status !== statusFilter) {
        continue;
      }
      if (searchQuery && !project.title.toLowerCase().includes(searchQuery) && !project.rawPrompt.toLowerCase().includes(searchQuery)) {
        continue;
      }
      userProjects.push(project);
    }
  }

  // Sort newest first
  userProjects.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({ projects: userProjects });
});

// Get single project
projectsRouter.get('/:id', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ project });
});

// Create video project
projectsRouter.post('/', async (req: Request, res: Response) => {
  const userId = getCurrentUserId(req);
  const user = db.users.get(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const {
    prompt,
    creationMode = 'text',
    aspectRatio = '16:9',
    duration = '30s',
    generationMode = 'fast',
    style = 'cinematic',
    voice = 'ai_voice',
    voiceLanguage = 'English',
    music = 'ai_music',
    musicMood = 'Cinematic Ambient',
    subtitles = 'auto',
    subtitleStyle = 'bold_social'
  } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({ error: 'Prompt description is required.' });
  }

  // Calculate required credits on the server
  const creditCost = calculateCreditCost(duration as VideoDuration, generationMode as VideoGenerationMode);

  // Enforce server-side credit verification
  if (user.credits < creditCost) {
    return res.status(402).json({
      error: `Insufficient credits. This generation requires ${creditCost} credits, but you have ${user.credits} credits available. Please upgrade your subscription or top up credits.`,
      requiredCredits: creditCost,
      currentCredits: user.credits
    });
  }

  // Check plan limits (e.g. Free plan max 1m)
  const userPlan = db.plans.find(p => p.id === user.subscriptionPlan);
  if (userPlan) {
    const durationMinutes = duration.endsWith('s') 
      ? parseInt(duration) / 60 
      : parseInt(duration.replace('m', ''));
    if (durationMinutes > userPlan.maxDurationMinutes) {
      return res.status(403).json({
        error: `Your current ${userPlan.name} plan allows videos up to ${userPlan.maxDurationMinutes} minutes. Please upgrade to create longer videos.`
      });
    }
  }

  // Deduct credits and record transaction ledger
  user.credits -= creditCost;
  db.transactions.unshift({
    id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: user.id,
    amount: -creditCost,
    type: 'usage',
    description: `Generated ${duration} video: "${prompt.slice(0, 40)}..."`,
    timestamp: new Date().toISOString()
  });

  const projectId = `proj_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const hasWatermark = user.subscriptionPlan === 'free';

  const newProject: VideoProject = {
    id: projectId,
    userId: user.id,
    title: prompt.slice(0, 50),
    rawPrompt: prompt,
    creationMode: creationMode as CreationMode,
    aspectRatio: aspectRatio as VideoAspectRatio,
    duration: duration as VideoDuration,
    generationMode: generationMode as VideoGenerationMode,
    style: style as VideoStyle,
    voice: voice as VoiceOption,
    voiceLanguage,
    music: music as MusicOption,
    musicMood,
    subtitles: subtitles as SubtitleOption,
    subtitleStyle,
    creditCost,
    status: 'queued',
    progressPercentage: 5,
    currentStepMessage: 'Queued for AI generation pipeline...',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    characters: [],
    chapters: [],
    scenes: [],
    hasWatermark,
    isPublicShare: false,
    shareId: projectId
  };

  db.projects.set(projectId, newProject);

  // Launch async job
  const job = await jobQueue.startGenerationJob(newProject);

  res.status(202).json({
    project: newProject,
    jobId: job.id,
    remainingCredits: user.credits
  });
});

// AI Scene Editor: "Tell AI what to change"
projectsRouter.post('/:id/scenes/:sceneId/ai-edit', async (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const scene = project.scenes.find(s => s.id === req.params.sceneId);
  if (!scene) {
    return res.status(404).json({ error: 'Scene not found' });
  }

  const { instruction } = req.body;
  if (!instruction) {
    return res.status(400).json({ error: 'Instruction is required' });
  }

  try {
    scene.status = 'generating';
    const result = await editSceneWithAI({
      scene,
      userInstruction: instruction,
      projectStyle: project.style,
      characters: project.characters
    });

    scene.visualPrompt = result.updatedVisualPrompt;
    scene.cameraMovement = result.updatedCameraMovement;
    scene.lighting = result.updatedLighting;
    if (result.updatedNarration) {
      scene.narrationText = result.updatedNarration;
      scene.subtitleText = result.updatedNarration;
    }
    scene.status = 'completed';
    project.updatedAt = new Date().toISOString();

    res.json({
      scene,
      explanation: result.explanation
    });
  } catch (err: any) {
    scene.status = 'completed';
    res.status(500).json({ error: err.message || 'Failed to edit scene with AI' });
  }
});

// Individual Scene Retry
projectsRouter.post('/:id/scenes/:sceneId/retry', async (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const success = await jobQueue.retryIndividualScene(project.id, req.params.sceneId);
  if (!success) {
    return res.status(404).json({ error: 'Scene could not be retried' });
  }

  const scene = project.scenes.find(s => s.id === req.params.sceneId);
  res.json({ scene, project });
});

// Update scene manual properties
projectsRouter.put('/:id/scenes/:sceneId', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const scene = project.scenes.find(s => s.id === req.params.sceneId);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });

  const { title, visualPrompt, cameraMovement, lighting, narrationText, subtitleText, durationSeconds } = req.body;
  if (title !== undefined) scene.title = title;
  if (visualPrompt !== undefined) scene.visualPrompt = visualPrompt;
  if (cameraMovement !== undefined) scene.cameraMovement = cameraMovement;
  if (lighting !== undefined) scene.lighting = lighting;
  if (narrationText !== undefined) scene.narrationText = narrationText;
  if (subtitleText !== undefined) scene.subtitleText = subtitleText;
  if (durationSeconds !== undefined) scene.durationSeconds = durationSeconds;

  project.updatedAt = new Date().toISOString();
  res.json({ scene, project });
});

// Update scene generated media (e.g. from Puter.js txt2vid)
projectsRouter.put('/:id/scenes/:sceneId/media', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const scene = project.scenes.find(s => s.id === req.params.sceneId);
  if (!scene) return res.status(404).json({ error: 'Scene not found' });

  const { mediaUrl, thumbnailUrl, status, errorMessage } = req.body;
  if (mediaUrl) {
    scene.mediaUrl = mediaUrl;
    // If it's the first scene, also set as project preview
    if (scene.sceneNumber === 1 || !project.finalVideoUrl) {
      project.finalVideoUrl = mediaUrl;
      project.thumbnailUrl = thumbnailUrl || mediaUrl;
    }
  }
  if (thumbnailUrl) scene.thumbnailUrl = thumbnailUrl;
  if (status) scene.status = status;
  if (errorMessage !== undefined) scene.errorMessage = errorMessage;

  project.updatedAt = new Date().toISOString();
  res.json({ scene, project });
});

// Delete scene
projectsRouter.delete('/:id/scenes/:sceneId', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const index = project.scenes.findIndex(s => s.id === req.params.sceneId);
  if (index === -1) return res.status(404).json({ error: 'Scene not found' });

  project.scenes.splice(index, 1);
  // Re-index remaining scenes
  project.scenes.forEach((s, idx) => {
    s.sceneNumber = idx + 1;
  });

  project.updatedAt = new Date().toISOString();
  res.json({ success: true, project });
});

// Add new scene
projectsRouter.post('/:id/scenes', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const newSceneNumber = project.scenes.length + 1;
  const newScene: VideoScene = {
    id: `sc_${Date.now()}_${newSceneNumber}`,
    chapterId: project.chapters[0]?.id,
    sceneNumber: newSceneNumber,
    title: `Scene ${newSceneNumber}`,
    durationSeconds: 15,
    visualPrompt: `${project.title}: Scene ${newSceneNumber} continuing the storyline.`,
    cameraMovement: 'Cinematic tracking shot',
    lighting: 'Soft ambient fill lighting',
    narrationText: 'The journey continues forward...',
    subtitleText: 'The journey continues forward...',
    status: 'completed',
    retryCount: 0,
    thumbnailUrl: project.scenes[0]?.thumbnailUrl || '/src/assets/images/hero_sample_cinematic_1790906701150.jpg',
    mediaUrl: project.scenes[0]?.mediaUrl || '/src/assets/images/hero_sample_cinematic_1790906701150.jpg'
  };

  project.scenes.push(newScene);
  project.updatedAt = new Date().toISOString();
  res.status(201).json({ scene: newScene, project });
});

// Reorder scenes
projectsRouter.put('/:id/reorder-scenes', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const { sceneIds } = req.body as { sceneIds: string[] };
  if (!Array.isArray(sceneIds)) {
    return res.status(400).json({ error: 'sceneIds array required' });
  }

  const reordered: VideoScene[] = [];
  sceneIds.forEach((id, idx) => {
    const sc = project.scenes.find(s => s.id === id);
    if (sc) {
      sc.sceneNumber = idx + 1;
      reordered.push(sc);
    }
  });

  project.scenes = reordered;
  project.updatedAt = new Date().toISOString();
  res.json({ project });
});

// Delete project
projectsRouter.delete('/:id', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  db.projects.delete(req.params.id);
  res.json({ success: true, deletedId: req.params.id });
});

// Toggle public share link
projectsRouter.post('/:id/share-toggle', (req: Request, res: Response) => {
  const project = db.projects.get(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  project.isPublicShare = !project.isPublicShare;
  if (project.isPublicShare && !project.shareId) {
    project.shareId = `share_${Math.random().toString(36).substring(2, 10)}`;
  }
  project.updatedAt = new Date().toISOString();
  res.json({ isPublicShare: project.isPublicShare, shareId: project.shareId });
});

// Public share view endpoint
projectsRouter.get('/public/:shareId', (req: Request, res: Response) => {
  for (const project of db.projects.values()) {
    if (project.shareId === req.params.shareId && project.isPublicShare) {
      return res.json({ project });
    }
  }
  return res.status(404).json({ error: 'Video not found or link has been disabled by owner' });
});
