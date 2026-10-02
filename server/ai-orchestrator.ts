import { GoogleGenAI } from '@google/genai';
import { 
  VideoProject, 
  VideoScene, 
  VideoChapter, 
  CharacterReference, 
  VideoDuration,
  VideoAspectRatio,
  VideoStyle 
} from '../src/types';

// Initialize Gemini client safely with headers per skill
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

// Calculate scene count and duration targets based on user requested duration
export function calculateSceneStructure(duration: VideoDuration): {
  totalSeconds: number;
  targetScenes: number;
  secondsPerScene: number;
  estimatedChapters: number;
} {
  switch (duration) {
    case '15s':
      return { totalSeconds: 15, targetScenes: 2, secondsPerScene: 7.5, estimatedChapters: 1 };
    case '30s':
      return { totalSeconds: 30, targetScenes: 3, secondsPerScene: 10, estimatedChapters: 1 };
    case '1m':
      return { totalSeconds: 60, targetScenes: 5, secondsPerScene: 12, estimatedChapters: 2 };
    case '3m':
      return { totalSeconds: 180, targetScenes: 12, secondsPerScene: 15, estimatedChapters: 3 };
    case '5m':
      return { totalSeconds: 300, targetScenes: 18, secondsPerScene: 16.6, estimatedChapters: 4 };
    case '10m':
      return { totalSeconds: 600, targetScenes: 32, secondsPerScene: 18.75, estimatedChapters: 5 };
    case '15m':
      return { totalSeconds: 900, targetScenes: 45, secondsPerScene: 20, estimatedChapters: 6 };
    case '20m':
      return { totalSeconds: 1200, targetScenes: 56, secondsPerScene: 21.4, estimatedChapters: 7 };
    case '30m':
      return { totalSeconds: 1800, targetScenes: 72, secondsPerScene: 25, estimatedChapters: 8 };
    default:
      return { totalSeconds: 30, targetScenes: 3, secondsPerScene: 10, estimatedChapters: 1 };
  }
}

export interface OrchestrationResult {
  title: string;
  creativeBrief: {
    logline: string;
    targetAudience: string;
    visualTone: string;
    narrativePacing: string;
  };
  characters: CharacterReference[];
  chapters: VideoChapter[];
  scenes: VideoScene[];
}

export async function orchestrateVideoPrompt(params: {
  rawPrompt: string;
  creationMode: string;
  aspectRatio: VideoAspectRatio;
  duration: VideoDuration;
  style: VideoStyle;
  voice: string;
  music: string;
  scriptText?: string;
  imageUrl?: string;
}): Promise<OrchestrationResult> {
  const structure = calculateSceneStructure(params.duration);

  // If Gemini API is available, request structured JSON orchestration
  if (ai) {
    try {
      const systemInstruction = `
You are the master AI director and video pipeline architect for MakeVidsAI.
The user wants to generate a video. Your job is to:
1. Formulate a rich, captivating creative brief (logline, target audience, visual tone, narrative pacing).
2. For long videos (or videos with characters), identify 1-2 key recurring characters and specify exact, persistent visual features (face, hair, clothing, age, body proportions) for visual consistency.
3. Break down the project into ${structure.estimatedChapters} coherent chapters.
4. Break down the story into ${structure.targetScenes} specific scenes (or scaled appropriately for the prompt).
5. For each scene:
   - Provide a vivid, high-fidelity visualPrompt. If characters appear, embed their exact physical markers to ensure character consistency across scenes.
   - Specify dynamic cameraMovement (e.g. 'Slow forward crane descent', 'Dynamic horizontal tracking', 'Subtle handheld macro dolly').
   - Specify lighting and atmosphere (e.g. 'Golden hour rim lighting', 'High contrast neon chiaroscuro').
   - Provide spoken narrationText suited for AI voiceover.
   - Provide subtitleText matching the narration.
   - Allocate duration in seconds (approx ${Math.round(structure.secondsPerScene)}s per scene).

Format the output strictly as valid JSON matching this schema:
{
  "title": "Short punchy video title",
  "creativeBrief": {
    "logline": "string",
    "targetAudience": "string",
    "visualTone": "string",
    "narrativePacing": "string"
  },
  "characters": [
    {
      "id": "char_1",
      "name": "string",
      "ageAppearance": "string",
      "gender": "string",
      "faceDescription": "string",
      "hairDescription": "string",
      "clothingDescription": "string",
      "bodyProportions": "string"
    }
  ],
  "chapters": [
    {
      "id": "chap_1",
      "chapterNumber": 1,
      "title": "string",
      "summary": "string",
      "sceneIndices": [0, 1]
    }
  ],
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "string",
      "durationSeconds": 15,
      "visualPrompt": "string",
      "cameraMovement": "string",
      "lighting": "string",
      "narrationText": "string",
      "subtitleText": "string",
      "characterIds": ["char_1"]
    }
  ]
}
`;

      const promptMessage = `
User Prompt: ${params.rawPrompt}
Creation Mode: ${params.creationMode}
Target Duration: ${params.duration} (${structure.totalSeconds} total seconds)
Target Scene Count: approximately ${structure.targetScenes} scenes
Visual Style: ${params.style}
Aspect Ratio: ${params.aspectRatio}
${params.scriptText ? `Provided Script: ${params.scriptText}` : ''}
${params.imageUrl ? `Starting Reference Image supplied` : ''}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptMessage,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7
        }
      });

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.scenes && Array.isArray(parsed.scenes) && parsed.scenes.length > 0) {
        // Map into typed objects
        const characters: CharacterReference[] = (parsed.characters || []).map((c: any, idx: number) => ({
          id: c.id || `char_${idx + 1}`,
          name: c.name || `Character ${idx + 1}`,
          ageAppearance: c.ageAppearance || 'Adult',
          gender: c.gender || 'Ambiguous',
          faceDescription: c.faceDescription || 'Expressive eyes, distinct facial structure',
          hairDescription: c.hairDescription || 'Dark neat hair',
          clothingDescription: c.clothingDescription || 'Signature tailored attire',
          bodyProportions: c.bodyProportions || 'Average build'
        }));

        const scenes: VideoScene[] = parsed.scenes.map((s: any, idx: number) => {
          const sceneId = `sc_${Date.now()}_${idx + 1}`;
          return {
            id: sceneId,
            sceneNumber: idx + 1,
            title: s.title || `Scene ${idx + 1}`,
            durationSeconds: s.durationSeconds || Math.round(structure.secondsPerScene),
            visualPrompt: s.visualPrompt || params.rawPrompt,
            cameraMovement: s.cameraMovement || 'Cinematic tracking shot',
            lighting: s.lighting || 'Balanced studio cinematic lighting',
            narrationText: s.narrationText || '',
            subtitleText: s.subtitleText || s.narrationText || '',
            characterIds: s.characterIds || (characters.length > 0 ? [characters[0].id] : []),
            status: 'queued',
            retryCount: 0,
            thumbnailUrl: '',
            mediaUrl: ''
          };
        });

        const chapters: VideoChapter[] = (parsed.chapters || []).map((chap: any, idx: number) => {
          const chapId = `chap_${Date.now()}_${idx + 1}`;
          const sceneIndices: number[] = chap.sceneIndices || [idx];
          const sceneIds = sceneIndices.map(i => scenes[i]?.id).filter(Boolean);
          
          // Link scene to chapter
          sceneIds.forEach(scId => {
            const sc = scenes.find(s => s.id === scId);
            if (sc) sc.chapterId = chapId;
          });

          return {
            id: chapId,
            chapterNumber: idx + 1,
            title: chap.title || `Chapter ${idx + 1}`,
            summary: chap.summary || 'Narrative chapter sequence',
            sceneIds: sceneIds.length > 0 ? sceneIds : [scenes[0]?.id]
          };
        });

        // Ensure every scene has a chapter
        if (chapters.length === 0) {
          const singleChap: VideoChapter = {
            id: `chap_${Date.now()}_1`,
            chapterNumber: 1,
            title: parsed.title || 'Main Story',
            summary: 'Complete sequence',
            sceneIds: scenes.map(s => s.id)
          };
          chapters.push(singleChap);
          scenes.forEach(s => s.chapterId = singleChap.id);
        } else {
          scenes.forEach(s => {
            if (!s.chapterId) s.chapterId = chapters[0].id;
          });
        }

        return {
          title: parsed.title || generateDefaultTitle(params.rawPrompt),
          creativeBrief: parsed.creativeBrief || {
            logline: params.rawPrompt,
            targetAudience: 'General Audience',
            visualTone: params.style,
            narrativePacing: 'Dynamic cinematic progression'
          },
          characters,
          chapters,
          scenes
        };
      }
    } catch (err) {
      console.warn('Gemini orchestration failed, executing high-fidelity fallback generator:', err);
    }
  }

  // Fallback intelligent generator (e.g. offline sandbox or missing key)
  return generateDeterministicVideoPlan(params, structure);
}

// AI Scene Editor: "Tell AI what to change"
export async function editSceneWithAI(params: {
  scene: VideoScene;
  userInstruction: string;
  projectStyle: VideoStyle;
  characters: CharacterReference[];
}): Promise<{
  updatedVisualPrompt: string;
  updatedCameraMovement: string;
  updatedLighting: string;
  updatedNarration: string;
  explanation: string;
}> {
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `
You are the AI video editor on MakeVidsAI. The user wants to adjust an individual scene.
Existing Scene Visual Prompt: "${params.scene.visualPrompt}"
Current Camera: "${params.scene.cameraMovement}"
Current Lighting: "${params.scene.lighting}"
Current Narration: "${params.scene.narrationText}"
Project Style: "${params.projectStyle}"
User Instruction: "${params.userInstruction}"

Incorporate the user instruction into the scene while maintaining narrative continuity.
Respond strictly in JSON:
{
  "updatedVisualPrompt": "string",
  "updatedCameraMovement": "string",
  "updatedLighting": "string",
  "updatedNarration": "string",
  "explanation": "Brief description of changes made"
}
`,
        config: {
          responseMimeType: 'application/json'
        }
      });
      return JSON.parse(response.text || '{}');
    } catch (err) {
      console.warn('AI Scene Edit Gemini call failed, using rule-based transformation:', err);
    }
  }

  // Smart rule-based modification fallback
  const instruction = params.userInstruction.toLowerCase();
  let updatedPrompt = params.scene.visualPrompt;
  let updatedCamera = params.scene.cameraMovement;
  let updatedLighting = params.scene.lighting;

  if (instruction.includes('cinematic') || instruction.includes('dramatic')) {
    updatedPrompt = `${params.scene.visualPrompt}, rendered with anamorphic widescreen lens, shallow depth of field, 8k film grade.`;
    updatedLighting = 'Dramatic high contrast chiaroscuro with atmospheric volumetric fog';
  } else if (instruction.includes('beach') || instruction.includes('ocean')) {
    updatedPrompt = `${params.scene.visualPrompt}, repositioned along a sun-drenched coastal beach with turquoise waves and fine golden sand.`;
  } else if (instruction.includes('sunset') || instruction.includes('golden hour')) {
    updatedLighting = 'Warm golden hour sunlight casting elongated amber shadows';
  } else if (instruction.includes('slower') || instruction.includes('slow')) {
    updatedCamera = 'Slow, graceful gliding steadicam motion with gradual focal pull';
  } else {
    updatedPrompt = `${params.scene.visualPrompt} (${params.userInstruction})`;
  }

  return {
    updatedVisualPrompt: updatedPrompt,
    updatedCameraMovement: updatedCamera,
    updatedLighting: updatedLighting,
    updatedNarration: params.scene.narrationText,
    explanation: `Applied modification: "${params.userInstruction}" to visual composition and lighting parameters.`
  };
}

// Helpers
function getRandomSampleImage(style: VideoStyle): string {
  switch (style) {
    case 'documentary':
      return '/src/assets/images/sample_nature_documentary_1790906712047.jpg';
    case 'product_commercial':
      return '/src/assets/images/sample_commercial_ad_1790906723033.jpg';
    case 'anime':
    case 'fantasy':
      return '/src/assets/images/sample_anime_fantasy_1790906733934.jpg';
    case 'cinematic':
    case 'sci-fi':
    default:
      return '/src/assets/images/hero_sample_cinematic_1790906701150.jpg';
  }
}

function generateDefaultTitle(prompt: string): string {
  const words = prompt.trim().split(/\s+/).slice(0, 6).join(' ');
  return words.length > 0 ? `${words.charAt(0).toUpperCase() + words.slice(1)}` : 'AI Vision Reel';
}

function generateDeterministicVideoPlan(
  params: {
    rawPrompt: string;
    creationMode: string;
    aspectRatio: VideoAspectRatio;
    duration: VideoDuration;
    style: VideoStyle;
    voice: string;
    music: string;
  },
  structure: {
    totalSeconds: number;
    targetScenes: number;
    secondsPerScene: number;
    estimatedChapters: number;
  }
): OrchestrationResult {
  const title = generateDefaultTitle(params.rawPrompt);
  const sampleImg = getRandomSampleImage(params.style);

  // Generate characters for consistency
  const characters: CharacterReference[] = [
    {
      id: 'char_main_01',
      name: 'Protagonist',
      ageAppearance: '30s',
      gender: 'Neutral',
      faceDescription: 'Focused, determined gaze with distinct angular cheekbones',
      hairDescription: 'Textured cropped styling',
      clothingDescription: `Signature ${params.style} aesthetic attire with defined color scheme`,
      bodyProportions: 'Athletic, proportioned silhouette'
    }
  ];

  const chapters: VideoChapter[] = [];
  const scenes: VideoScene[] = [];
  const scenesPerChapter = Math.ceil(structure.targetScenes / structure.estimatedChapters);

  let sceneCounter = 1;
  for (let c = 1; c <= structure.estimatedChapters; c++) {
    const chapterId = `chap_${Date.now()}_${c}`;
    const chapterSceneIds: string[] = [];

    const chapterTitles = [
      'The Spark of Genesis',
      'Rising Horizons',
      'The Turning Crucible',
      'Echoes in the Deep',
      'The Apex Summit',
      'Convergence of Fates',
      'Beyond the Frontier',
      'Eternal Legacy'
    ];

    const chapTitle = chapterTitles[c - 1] || `Chapter ${c}: Unfolding Journey`;

    for (let s = 1; s <= scenesPerChapter && sceneCounter <= structure.targetScenes; s++) {
      const sceneId = `sc_${Date.now()}_${sceneCounter}`;
      chapterSceneIds.push(sceneId);

      const cameraMoves = [
        'Panoramic crane glide ascending into sky',
        'Dynamic lateral tracking along subject velocity',
        'Close-up macro focal rack with subtle handheld drift',
        'Sweeping circular orbit around center of action',
        'Low-angle wide perspective gazing toward the horizon'
      ];

      const lightings = [
        'Radiant cinematic golden hour with soft mist reflections',
        'High contrast atmospheric twilight with vivid rim illumination',
        'Crisp studio directional key lighting with soft shadow fill',
        'Deep celestial nebula glow with starlight highlights'
      ];

      scenes.push({
        id: sceneId,
        chapterId,
        sceneNumber: sceneCounter,
        durationSeconds: Math.round(structure.secondsPerScene),
        title: `Scene ${sceneCounter}: ${chapTitle} — Part ${s}`,
        visualPrompt: `${params.rawPrompt}. [Scene ${sceneCounter}]: ${chapTitle}. Style: ${params.style}. Character reference: Protagonist with ${characters[0].faceDescription}, wearing ${characters[0].clothingDescription}. High-resolution cinematic render.`,
        cameraMovement: cameraMoves[(sceneCounter - 1) % cameraMoves.length],
        lighting: lightings[(sceneCounter - 1) % lightings.length],
        narrationText: `As the story deepens into ${chapTitle.toLowerCase()}, our journey reveals the profound essence of ${params.rawPrompt.slice(0, 45)}...`,
        subtitleText: `Exploring the turning moments of our narrative journey...`,
        characterIds: [characters[0].id],
        status: 'queued',
        retryCount: 0,
        thumbnailUrl: '',
        mediaUrl: ''
      });

      sceneCounter++;
    }

    chapters.push({
      id: chapterId,
      chapterNumber: c,
      title: chapTitle,
      summary: `Sequential narrative arc covering scenes in ${chapTitle}.`,
      sceneIds: chapterSceneIds
    });
  }

  return {
    title,
    creativeBrief: {
      logline: `A captivating exploration of ${params.rawPrompt} told across ${structure.targetScenes} unified visual scenes.`,
      targetAudience: 'Creators, storytellers, and visual media enthusiasts',
      visualTone: `${params.style.toUpperCase()} grade imagery with harmonious color pacing`,
      narrativePacing: 'Steady, deliberate story arc building to a memorable visual culmination'
    },
    characters,
    chapters,
    scenes
  };
}
