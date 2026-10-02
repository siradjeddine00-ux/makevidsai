import { aiService } from './index';
import { VideoProject, VideoScene, VideoStyle } from '../../types';

/**
 * Executes Puter.js video generation for an individual scene,
 * handling automatic retries up to 3 times before failing the isolated scene.
 */
export async function generateSceneWithPuter(
  projectId: string,
  scene: VideoScene,
  style: VideoStyle,
  onStatusUpdate?: (status: string) => void
): Promise<{ mediaUrl: string; thumbnailUrl: string; success: boolean }> {
  const maxRetries = 3;
  let attempts = 0;

  while (attempts < maxRetries) {
    attempts++;
    try {
      onStatusUpdate?.(`Generating Scene ${scene.sceneNumber} (Attempt ${attempts}/${maxRetries}) via Puter.js...`);
      
      const result = await aiService.generateSceneClip(scene, style);

      // Persist generated media to backend project scene
      await fetch(`/api/projects/${projectId}/scenes/${scene.id}/media`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl: result.mediaUrl,
          thumbnailUrl: result.thumbnailUrl,
          status: 'completed'
        })
      });

      return {
        mediaUrl: result.mediaUrl,
        thumbnailUrl: result.thumbnailUrl,
        success: true
      };
    } catch (err: any) {
      console.warn(`[Puter Video Worker] Scene ${scene.sceneNumber} attempt ${attempts} failed:`, err);
      
      if (attempts >= maxRetries) {
        // Mark scene as failed on the backend without breaking the rest of the project
        await fetch(`/api/projects/${projectId}/scenes/${scene.id}/media`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'failed',
            errorMessage: err?.message || 'Puter.js video generation timed out'
          })
        });

        return {
          mediaUrl: scene.mediaUrl || '',
          thumbnailUrl: scene.thumbnailUrl || '',
          success: false
        };
      }
      // Brief pause before retry
      await new Promise(r => setTimeout(r, 600));
    }
  }

  return {
    mediaUrl: scene.mediaUrl || '',
    thumbnailUrl: scene.thumbnailUrl || '',
    success: false
  };
}
