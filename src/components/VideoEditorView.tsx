import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Sparkles, 
  RotateCw, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Plus, 
  Save, 
  Check, 
  Play, 
  Layers, 
  UserCheck, 
  Film, 
  Sliders 
} from 'lucide-react';
import { VideoProject, VideoScene, CharacterReference } from '../types';

interface VideoEditorViewProps {
  project: VideoProject;
  onBack: () => void;
  onUpdateProject: (updated: VideoProject) => void;
  onRetryScene: (sceneId: string) => void;
}

export const VideoEditorView: React.FC<VideoEditorViewProps> = ({
  project,
  onBack,
  onUpdateProject,
  onRetryScene
}) => {
  const [selectedSceneId, setSelectedSceneId] = useState<string>(project.scenes[0]?.id || '');
  const [aiInstruction, setAiInstruction] = useState('');
  const [isAiModifying, setIsAiModifying] = useState(false);
  const [modificationSuccessMessage, setModificationSuccessMessage] = useState<string | null>(null);

  // Active scene manual edit fields
  const activeScene = project.scenes.find(s => s.id === selectedSceneId) || project.scenes[0];
  const [editTitle, setEditTitle] = useState(activeScene?.title || '');
  const [editPrompt, setEditPrompt] = useState(activeScene?.visualPrompt || '');
  const [editCamera, setEditCamera] = useState(activeScene?.cameraMovement || '');
  const [editLighting, setEditLighting] = useState(activeScene?.lighting || '');
  const [editNarration, setEditNarration] = useState(activeScene?.narrationText || '');
  const [editDuration, setEditDuration] = useState(activeScene?.durationSeconds || 15);
  const [manualSaveSuccess, setManualSaveSuccess] = useState(false);

  // Sync edit form when active scene changes
  React.useEffect(() => {
    if (activeScene) {
      setEditTitle(activeScene.title);
      setEditPrompt(activeScene.visualPrompt);
      setEditCamera(activeScene.cameraMovement);
      setEditLighting(activeScene.lighting);
      setEditNarration(activeScene.narrationText);
      setEditDuration(activeScene.durationSeconds);
      setModificationSuccessMessage(null);
    }
  }, [activeScene?.id]);

  // "Tell AI what to change" handler (Section 15)
  const handleAiChange = async () => {
    if (!aiInstruction.trim() || !activeScene) return;

    setIsAiModifying(true);
    setModificationSuccessMessage(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/scenes/${activeScene.id}/ai-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instruction: aiInstruction.trim() })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply AI changes');

      // Update local project scenes
      const updatedScenes = project.scenes.map(s => s.id === activeScene.id ? data.scene : s);
      const updatedProject = { ...project, scenes: updatedScenes };
      onUpdateProject(updatedProject);

      setEditPrompt(data.scene.visualPrompt);
      setEditCamera(data.scene.cameraMovement);
      setEditLighting(data.scene.lighting);
      setModificationSuccessMessage(data.explanation || 'Scene updated successfully with AI.');
      setAiInstruction('');
    } catch (err: any) {
      alert(err.message || 'Error executing AI scene edit');
    } finally {
      setIsAiModifying(false);
    }
  };

  // Manual save handler
  const handleManualSave = async () => {
    if (!activeScene) return;

    try {
      const res = await fetch(`/api/projects/${project.id}/scenes/${activeScene.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          visualPrompt: editPrompt,
          cameraMovement: editCamera,
          lighting: editLighting,
          narrationText: editNarration,
          subtitleText: editNarration,
          durationSeconds: Number(editDuration)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');

      const updatedScenes = project.scenes.map(s => s.id === activeScene.id ? data.scene : s);
      onUpdateProject({ ...project, scenes: updatedScenes });
      setManualSaveSuccess(true);
      setTimeout(() => setManualSaveSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to save scene');
    }
  };

  // Add Scene
  const handleAddScene = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/scenes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateProject(data.project);
        setSelectedSceneId(data.scene.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Scene
  const handleDeleteScene = async (sceneId: string) => {
    if (project.scenes.length <= 1) {
      alert('A project must contain at least one scene.');
      return;
    }

    try {
      const res = await fetch(`/api/projects/${project.id}/scenes/${sceneId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateProject(data.project);
        if (selectedSceneId === sceneId) {
          setSelectedSceneId(data.project.scenes[0]?.id || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reorder Scenes (Move Up / Down)
  const handleMoveScene = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.scenes.length) return;

    const newScenes = [...project.scenes];
    const temp = newScenes[index];
    newScenes[index] = newScenes[targetIndex];
    newScenes[targetIndex] = temp;

    const sceneIds = newScenes.map(s => s.id);

    try {
      const res = await fetch(`/api/projects/${project.id}/reorder-scenes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneIds })
      });
      const data = await res.json();
      if (res.ok) {
        onUpdateProject(data.project);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Player
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">AI Studio Video Editor</h1>
            <p className="text-xs text-neutral-400">
              {project.title} · {project.scenes.length} Scenes · {project.duration}
            </p>
          </div>
        </div>

        <button
          onClick={handleAddScene}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 shadow-sm cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Scene
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Scene Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Story Timeline ({project.scenes.length} Scenes)
            </h3>
            <span className="text-xs text-neutral-500">Click a card to inspect</span>
          </div>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {project.scenes.map((scene, idx) => {
              const isSelected = scene.id === selectedSceneId;
              return (
                <div
                  key={scene.id}
                  onClick={() => setSelectedSceneId(scene.id)}
                  className={`rounded-xl border p-3 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
                      : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                      {scene.thumbnailUrl || scene.mediaUrl ? (
                        <img
                          src={scene.thumbnailUrl || scene.mediaUrl}
                          alt={scene.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-neutral-500">
                          <Film className="h-5 w-5 text-indigo-400/80 mb-1" />
                          <span className="text-[10px] font-mono">Scene {scene.sceneNumber}</span>
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1 py-0.5 text-[9px] font-mono text-neutral-300">
                        {scene.durationSeconds}s
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-semibold text-white truncate">
                            Scene {scene.sceneNumber}: {scene.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 line-clamp-2 mt-1 leading-snug">
                          {scene.visualPrompt}
                        </p>
                      </div>

                      {/* Card Reordering & Management Actions */}
                      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80 mt-2">
                        <div className="flex items-center gap-1">
                          <button
                            title="Move Up"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveScene(idx, 'up');
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </button>
                          <button
                            title="Move Down"
                            disabled={idx === project.scenes.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMoveScene(idx, 'down');
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <button
                            title="Regenerate this scene"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRetryScene(scene.id);
                            }}
                            className="text-[11px] text-neutral-400 hover:text-indigo-400 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCw className="h-3 w-3" />
                            Regen
                          </button>
                          <button
                            title="Delete Scene"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScene(scene.id);
                            }}
                            className="text-neutral-500 hover:text-rose-400 p-1 cursor-pointer"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Character Consistency Reference Card (Section 8) */}
          {project.characters && project.characters.length > 0 && (
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <h4 className="text-xs font-semibold text-white flex items-center gap-1.5 mb-2">
                <UserCheck className="h-3.5 w-3.5 text-indigo-400" />
                Character Consistency Model
              </h4>
              {project.characters.map((char) => (
                <div key={char.id} className="text-[11px] text-neutral-400 space-y-1">
                  <p className="font-semibold text-neutral-200">{char.name} ({char.ageAppearance})</p>
                  <p><span className="text-neutral-500">Visual Features:</span> {char.faceDescription}</p>
                  <p><span className="text-neutral-500">Outfit:</span> {char.clothingDescription}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Selected Scene Inspector & "Tell AI What to Change" (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* "Tell AI what to change" interactive box (Section 15) */}
          <div className="rounded-2xl border border-indigo-500/40 bg-gradient-to-b from-indigo-950/20 to-neutral-900/80 p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Tell AI what to change</h3>
            </div>
            <p className="text-xs text-neutral-400 mb-3">
              Describe how you want to modify Scene {activeScene?.sceneNumber}. The AI interprets the prompt and adjusts lighting, camera, and scene components.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={aiInstruction}
                onChange={(e) => setAiInstruction(e.target.value)}
                placeholder='e.g. "Make this scene more cinematic", "Change the background to a beach", "Change the lighting to sunset"'
                className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 px-3.5 py-2 text-xs sm:text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                disabled={!aiInstruction.trim() || isAiModifying}
                onClick={handleAiChange}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all cursor-pointer whitespace-nowrap shadow-md shadow-indigo-600/20"
              >
                {isAiModifying ? <RotateCw className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                {isAiModifying ? 'Updating...' : 'Update Scene'}
              </button>
            </div>

            {/* Quick Inspiration Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
              {[
                'Make this scene more cinematic',
                'Change lighting to golden hour sunset',
                'Make the camera movement slower',
                'Change the background to a beach'
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAiInstruction(suggestion)}
                  className="rounded-md border border-neutral-800 bg-neutral-900/90 px-2 py-0.5 text-[11px] text-neutral-400 hover:text-white hover:border-neutral-700 transition-colors cursor-pointer"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>

            {modificationSuccessMessage && (
              <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 p-2.5 text-xs text-emerald-300">
                {modificationSuccessMessage}
              </div>
            )}
          </div>

          {/* Manual Scene Attributes Editor */}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Sliders className="h-4 w-4 text-neutral-400" />
                Scene {activeScene?.sceneNumber} Parameters
              </h3>
              <button
                type="button"
                onClick={handleManualSave}
                className="flex items-center gap-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {manualSaveSuccess ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
                {manualSaveSuccess ? 'Saved' : 'Save Changes'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Scene Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Duration (seconds)</label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={editDuration}
                  onChange={(e) => setEditDuration(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Visual Generation Prompt</label>
              <textarea
                rows={3}
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Camera Movement</label>
                <input
                  type="text"
                  value={editCamera}
                  onChange={(e) => setEditCamera(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-1">Lighting & Atmosphere</label>
                <input
                  type="text"
                  value={editLighting}
                  onChange={(e) => setEditLighting(e.target.value)}
                  className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-400 mb-1">Narration & Spoken Subtitle Text</label>
              <textarea
                rows={2}
                value={editNarration}
                onChange={(e) => setEditNarration(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-xs text-neutral-200 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
