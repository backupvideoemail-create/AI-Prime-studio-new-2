import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';
import sharp from 'sharp';
import { GoogleGenAI } from '@google/genai';

type MediaType = 'photo' | 'video';

interface TemplateMetadata {
  id: string;
  type: MediaType;
  name: string;
  category: string;
  subCategory: string;
  gender?: 'male' | 'female' | 'unisex';
  description: string;
  badge?: string;
  previewPath: string;
  coverPath?: string;
  beforePath?: string;
  afterPath?: string;
  videoPath?: string;
  prompt: string;
  creditCost: number;
  featured: boolean;
  sortPriority: number;
  isActive: boolean;
  likesCount: number;
  tags: string[];
}

const ROOT = process.cwd();
const PHOTO_ROOT = path.join(ROOT, 'template-library', 'photo');
const VIDEO_ROOT = path.join(ROOT, 'template-library', 'video');
const DROP_ROOT = path.join(ROOT, 'template-drop');
const STATE_FILE = path.join(DROP_ROOT, '.processed.json');
const TEMP_ROOT = path.join(ROOT, '.template-auto-drop-tmp');

const PHOTO_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const VIDEO_EXTS = new Set(['.mp4', '.webm', '.mov', '.m4v']);
const CATEGORIES = [
  'professional', 'portrait', 'cinematic', 'travel', 'fashion', 'social',
  'background', 'creative', 'royal', 'wedding', 'trending', 'fitness',
];

const DEFAULT_PHOTO_CREDITS = Number(process.env.TEMPLATE_DEFAULT_PHOTO_CREDITS || 50);
const DEFAULT_VIDEO_CREDITS = Number(process.env.TEMPLATE_DEFAULT_VIDEO_CREDITS || 120);
const MAX_VIDEO_BYTES = 70 * 1024 * 1024;

function fail(message: string): never {
  throw new Error(message);
}

function normalizeText(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
}

function normalizeGender(value: unknown): TemplateMetadata['gender'] {
  const gender = String(value || '').toLowerCase();
  if (gender === 'male' || gender === 'female' || gender === 'unisex') return gender;
  return 'unisex';
}

function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 10);
}

function parseJsonResponse(raw: string): any {
  const cleaned = raw.trim()
    .replace(/^\uFEFF/, '')
    .replace(/^\s*```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '');

  try {
    return JSON.parse(cleaned);
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace >= 0 && lastBrace > firstBrace) {
      return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
    }
    throw new Error('Gemini returned invalid JSON metadata.');
  }
}

function slugify(input: string): string {
  const slug = input.toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return slug || `template-${crypto.randomBytes(4).toString('hex')}`;
}

function ensureUniqueId(baseId: string, type: MediaType): string {
  const root = type === 'photo' ? PHOTO_ROOT : VIDEO_ROOT;
  let id = baseId;
  let counter = 2;
  while (fs.existsSync(path.join(root, id))) id = `${baseId}-${counter++}`;
  return id;
}

function nextTopPriority(type: MediaType): number {
  const root = type === 'photo' ? PHOTO_ROOT : VIDEO_ROOT;
  if (!fs.existsSync(root)) return 1;

  const priorities: number[] = [];
  for (const folder of fs.readdirSync(root)) {
    const jsonPath = path.join(root, folder, 'template.json');
    if (!fs.existsSync(jsonPath)) continue;
    try {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      if (typeof data.sortPriority === 'number' && Number.isFinite(data.sortPriority)) {
        priorities.push(data.sortPriority);
      }
    } catch {
      // Ignore malformed legacy entries.
    }
  }

  return priorities.length ? Math.min(...priorities) - 1 : 1;
}

function getVideoCreditCost(category: string): number {
  const configured = Number(process.env.TEMPLATE_DEFAULT_VIDEO_CREDITS);
  if (Number.isFinite(configured) && configured > 0) return configured;
  if (category === 'face_swap') return 150;
  if (category === 'video_to_video') return 140;
  if (category === 'image_to_video') return 120;
  return DEFAULT_VIDEO_CREDITS;
}

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) fail('GEMINI_API_KEY is missing.');
  return new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-template-auto-drop' } },
  });
}

function readState(): Record<string, string> {
  if (!fs.existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeState(state: Record<string, string>): void {
  fs.mkdirSync(DROP_ROOT, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

function hashFile(filePath: string): string {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

async function extractVideoFrame(videoPath: string): Promise<string> {
  fs.mkdirSync(TEMP_ROOT, { recursive: true });
  const output = path.join(
    TEMP_ROOT,
    `${path.basename(videoPath, path.extname(videoPath))}-frame.jpg`,
  );

  try {
    execFileSync(
      'ffmpeg',
      ['-y', '-ss', '0.5', '-i', videoPath, '-frames:v', '1', '-vf', 'scale=900:-2', '-q:v', '3', output],
      { stdio: 'pipe' },
    );
  } catch {
    throw new Error('Video processing needs ffmpeg. GitHub Actions installs it automatically.');
  }

  if (!fs.existsSync(output)) throw new Error('ffmpeg did not produce a preview frame.');
  return output;
}

async function analyzeWithGemini(
  filePath: string,
  mediaType: MediaType,
  client: GoogleGenAI,
) {
  const analysisImagePath = mediaType === 'video' ? await extractVideoFrame(filePath) : filePath;
  const buffer = fs.readFileSync(analysisImagePath);
  const ext = path.extname(filePath).toLowerCase();
  const mimeType = mediaType === 'video'
    ? 'image/jpeg'
    : ({ '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp' } as Record<string, string>)[ext] || 'image/jpeg';

  const instruction = `
Analyze this reference image/frame as a style template for an AI creative studio.
Return ONLY valid JSON:
{
  "name": "2-5 word template name",
  "category": "one of: ${CATEGORIES.join(', ')}",
  "subCategory": "specific style group",
  "gender": "male | female | unisex",
  "description": "short customer-facing description",
  "prompt": "useful visual AI transformation prompt that preserves the uploaded person's exact recognizable identity",
  "tags": ["5-10 short relevant tags"]
}

Rules:
- Describe styling, clothing, environment, lighting, composition and mood.
- Do not mention celebrities, public figures, or copyrighted characters.
- Do not invent facts that cannot be inferred.
- The prompt must be usable on a customer's uploaded photo.
- Preserve exact recognizable identity when the prompt is later used.
- For video, analyze the representative frame without claiming that motion was generated by Gemini.
`;

  const response = await client.models.generateContent({
    model: process.env.TEMPLATE_METADATA_MODEL || 'gemini-2.5-flash',
    contents: [{
      role: 'user',
      parts: [
        { inlineData: { data: buffer.toString('base64'), mimeType } },
        { text: instruction },
      ],
    }],
    config: { responseMimeType: 'application/json', maxOutputTokens: 800 },
  });

  const metadata = parseJsonResponse(response.text || '{}');
  const categoryRaw = String(metadata.category || '').toLowerCase();

  return {
    name: normalizeText(metadata.name, 'AI Creative Style'),
    category: CATEGORIES.includes(categoryRaw) ? categoryRaw : 'creative',
    subCategory: normalizeText(metadata.subCategory, 'AI Transformation'),
    gender: normalizeGender(metadata.gender),
    description: normalizeText(metadata.description, 'AI-powered visual transformation style.'),
    prompt: normalizeText(
      metadata.prompt,
      'Create a premium photorealistic transformation while preserving the exact recognizable identity of the uploaded person.',
    ),
    tags: normalizeTags(metadata.tags),
  };
}

async function createPhotoTemplate(inputPath: string, meta: any): Promise<TemplateMetadata> {
  fs.mkdirSync(PHOTO_ROOT, { recursive: true });
  const id = ensureUniqueId(slugify(meta.name), 'photo');
  const templateDir = path.join(PHOTO_ROOT, id);
  fs.mkdirSync(templateDir, { recursive: true });

  // Same reference is used for both sides so the identity is never fabricated.
  for (const output of ['before.jpg', 'after.jpg', 'preview.jpg']) {
    await sharp(inputPath)
      .rotate()
      .resize({ width: 900, height: 1125, fit: 'cover' })
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(path.join(templateDir, output));
  }

  const metadata: TemplateMetadata = {
    id,
    type: 'photo',
    name: meta.name,
    category: meta.category,
    subCategory: meta.subCategory,
    gender: meta.gender,
    description: meta.description,
    badge: `✨ ${meta.name}`,
    previewPath: `/template-library/photo/${id}/preview.jpg`,
    beforePath: `/template-library/photo/${id}/before.jpg`,
    afterPath: `/template-library/photo/${id}/after.jpg`,
    prompt: meta.prompt,
    creditCost: DEFAULT_PHOTO_CREDITS,
    featured: false,
    sortPriority: nextTopPriority('photo'),
    isActive: true,
    likesCount: 0,
    tags: meta.tags,
  };

  fs.writeFileSync(path.join(templateDir, 'template.json'), JSON.stringify(metadata, null, 2) + '\n');
  return metadata;
}

async function createVideoTemplate(inputPath: string, meta: any): Promise<TemplateMetadata> {
  fs.mkdirSync(VIDEO_ROOT, { recursive: true });
  const id = ensureUniqueId(slugify(meta.name), 'video');
  const templateDir = path.join(VIDEO_ROOT, id);
  fs.mkdirSync(templateDir, { recursive: true });

  const frame = await extractVideoFrame(inputPath);
  await sharp(frame)
    .resize({ width: 900, height: 1125, fit: 'cover' })
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(path.join(templateDir, 'cover.jpg'));

  const ext = path.extname(inputPath).toLowerCase();
  const videoName = `video${ext}`;
  fs.copyFileSync(inputPath, path.join(templateDir, videoName));

  const metadata: TemplateMetadata = {
    id,
    type: 'video',
    name: meta.name,
    category: meta.category,
    subCategory: meta.subCategory,
    gender: meta.gender,
    description: meta.description,
    badge: `🎬 ${meta.name}`,
    previewPath: `/template-library/video/${id}/cover.jpg`,
    coverPath: `/template-library/video/${id}/cover.jpg`,
    videoPath: `/template-library/video/${id}/${videoName}`,
    prompt: meta.prompt,
    creditCost: getVideoCreditCost(meta.category),
    featured: false,
    sortPriority: nextTopPriority('video'),
    isActive: true,
    likesCount: 0,
    tags: meta.tags,
  };

  fs.writeFileSync(path.join(templateDir, 'template.json'), JSON.stringify(metadata, null, 2) + '\n');
  return metadata;
}

function isSupported(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return PHOTO_EXTS.has(ext) || VIDEO_EXTS.has(ext);
}

function mediaType(filePath: string): MediaType {
  const ext = path.extname(filePath).toLowerCase();
  if (PHOTO_EXTS.has(ext)) return 'photo';
  if (VIDEO_EXTS.has(ext)) return 'video';
  throw new Error(`Unsupported media type: ${ext || 'unknown'}`);
}

function collectFiles(input: string): string[] {
  const resolved = path.resolve(ROOT, input);
  if (!fs.existsSync(resolved)) fail(`Input does not exist: ${input}`);
  if (fs.statSync(resolved).isFile()) return [resolved];
  return fs.readdirSync(resolved)
    .map((name) => path.join(resolved, name))
    .filter((candidate) => fs.statSync(candidate).isFile())
    .filter(isSupported);
}

async function main() {
  const input = process.argv[2] || 'template-drop';
  const client = getGeminiClient();
  const files = collectFiles(input);
  const state = readState();

  if (!files.length) {
    console.log('No supported photo/video files found. Nothing to do.');
    return;
  }

  for (const file of files) {
    const relative = path.relative(ROOT, file).replaceAll('\\', '/');
    const hash = hashFile(file);

    if (state[relative] === hash) {
      console.log(`⏭️ Already processed: ${relative}`);
      continue;
    }

    try {
      const type = mediaType(file);
      if (type === 'video' && fs.statSync(file).size > MAX_VIDEO_BYTES) {
        throw new Error('Video is larger than the safe repository auto-drop limit. Use a smaller video for this GitHub-based workflow.');
      }

      console.log(`\n🤖 Analyzing ${type}: ${relative}`);
      const meta = await analyzeWithGemini(file, type, client);
      const generated = type === 'photo'
        ? await createPhotoTemplate(file, meta)
        : await createVideoTemplate(file, meta);

      state[relative] = hash;
      writeState(state);

      console.log(`✅ Created ${generated.type} template: ${generated.id}`);
      console.log(`   Name: ${generated.name}`);
      console.log(`   Category: ${generated.category}`);
      console.log(`   Priority: ${generated.sortPriority}`);
      console.log(`   Credits: ${generated.creditCost}`);
    } catch (error: any) {
      console.error(`❌ Failed: ${relative}`);
      console.error(error?.message || error);
      process.exitCode = 1;
    }
  }
}

main()
  .catch((error) => {
    console.error('❌ Template Auto-Drop failed:', error?.message || error);
    process.exit(1);
  })
  .finally(() => {
    if (fs.existsSync(TEMP_ROOT)) fs.rmSync(TEMP_ROOT, { recursive: true, force: true });
  });
