import { db } from './db';
import { VideoProject, GenerationJob, VideoDuration, VideoGenerationMode } from '../src/types';
import { orchestrateVideoPrompt } from './ai-orchestrator';

// Calculate required credit cost based on duration and generation mode
export function calculateCreditCost(duration: VideoDuration, mode: VideoGenerationMode): number {
  let baseCredits = 20;
  switch (duration) {
    case '15s': baseCredits = 10; break;
    case '30s': baseCredits = 20; break;
    case '1m': baseCredits = 35; break;
    case '3m': baseCredits = 75; break;
    case '5m': baseCredits = 120; break;
    case '10m': baseCredits = 240; break;
    case '15m': baseCredits = 360; break;
    case '20m': baseCredits = 480; break;
    case '30m': baseCredits = 700; break;
  }
  if (mode === 'high_quality') {
    baseCredits = Math.round(baseCredits * 1.25);
  }
  return baseCredits;
}

export class JobQueueEngine {
  private activeJobs: Map<string, NodeJS.Timeout> = new Map();

  public async startGenerationJob(project: VideoProject): Promise<GenerationJob> {
    const job: GenerationJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      projectId: project.id,
      status: 'processing',
      progress: 5,
      currentStage: 'brief',
      totalScenes: 0,
      completedScenes: 0,
      failedScenes: 0,
      retryCount: 0,
      startTime: new Date().toISOString()
    };

    db.jobs.set(job.id, job);

    // Run async pipeline in background
    this.runPipeline(job.id, project.id).catch(err => {
      console.error(`Pipeline failure for job ${job.id}:`, err);
      job.status = 'failed';
      job.errorMessage = err.message || 'Video pipeline failed during execution.';
      const proj = db.projects.get(project.id);
      if (proj) {
        proj.status = 'failed';
        proj.currentStepMessage = `Generation failed: ${job.errorMessage}`;
      }
    });

    return job;
  }

  private async runPipeline(jobId: string, projectId: string) {
    const job = db.jobs.get(jobId);
    const project = db.projects.get(projectId);
    if (!job || !project) return;

    project.status = 'processing';
    project.progressPercentage = 10;
    project.currentStepMessage = 'Creating script & creative brief...';

    // Step 1: AI Prompt Orchestration (Creative brief & script)
    await new Promise(r => setTimeout(r, 600));
    job.currentStage = 'script';
    job.progress = 20;
    project.progressPercentage = 20;
    project.currentStepMessage = 'Planning chapters and sequences...';

    const orchestrated = await orchestrateVideoPrompt({
      rawPrompt: project.rawPrompt,
      creationMode: project.creationMode,
      aspectRatio: project.aspectRatio,
      duration: project.duration,
      style: project.style,
      voice: project.voice,
      music: project.music
    });

    project.title = orchestrated.title;
    project.creativeBrief = orchestrated.creativeBrief;
    project.characters = orchestrated.characters;
    project.chapters = orchestrated.chapters;
    project.scenes = orchestrated.scenes;

    job.totalScenes = project.scenes.length;
    job.completedScenes = 0;
    job.currentStage = 'scenes';
    job.progress = 25;
    project.status = 'processing';
    project.progressPercentage = 25;
    project.currentStepMessage = `Script and ${project.scenes.length} scene(s) prepared. Generating clips via Puter.js...`;
    project.updatedAt = new Date().toISOString();
  }

  // Quality Control check as demanded by Section 40
  public validateProjectQuality(project: VideoProject): boolean {
    if (!project.scenes || project.scenes.length === 0) return false;
    const allCompleted = project.scenes.every(s => s.status === 'completed' && Boolean(s.mediaUrl));
    return allCompleted;
  }

  // Individual Scene Retry (Section 6, 7, 30)
  public async retryIndividualScene(projectId: string, sceneId: string): Promise<boolean> {
    const project = db.projects.get(projectId);
    if (!project) return false;

    const scene = project.scenes.find(s => s.id === sceneId);
    if (!scene) return false;

    scene.status = 'queued';
    scene.retryCount = (scene.retryCount || 0) + 1;
    scene.errorMessage = undefined;
    project.status = 'processing';
    project.currentStepMessage = `Retrying Scene ${scene.sceneNumber} via Puter.js...`;
    project.updatedAt = new Date().toISOString();
    return true;
  }
}

export const jobQueue = new JobQueueEngine();
