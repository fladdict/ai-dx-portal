import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 全ページ共通のメタデータ(02-site-architecture.md / 05-content-strategy.md 参照)
const baseSchema = z.object({
  title: z.string(),
  // 冒頭3行のエグゼクティブサマリー(執筆契約 第5条)
  summary: z.string(),
  sources: z.array(z.string()).default([]),
  updated: z.coerce.date(),
  review_by: z.coerce.date(),
  status: z.enum(['draft', 'review', 'published']).default('draft'),
  order: z.number().int().optional(),
});

const articleCollection = (dir: string) =>
  defineCollection({
    loader: glob({ pattern: '**/*.{md,mdx}', base: `./src/content/${dir}` }),
    schema: baseSchema,
  });

// 原理編・AI-Ready編・組織人材編・ロードマップ編は共通スキーマ
const principles = articleCollection('principles');
const readiness = articleCollection('readiness');
const organization = articleCollection('organization');
const roadmap = articleCollection('roadmap');

const departments = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/departments' }),
  schema: baseSchema,
});

const patterns = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/patterns' }),
  schema: baseSchema.extend({
    departments: z.array(z.string()).min(1),
    related: z.array(z.string()).default([]),
    impact: z.number().int().min(1).max(5),
    difficulty: z.number().int().min(1).max(5),
    horizon: z.enum(['now', '1y', 'watch']),
    scalability: z.enum(['scales', 'local', 'debt-risk']),
    maturity: z.enum(['experimental', 'practical', 'standard']),
  }),
});

const antiPatterns = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/anti-patterns' }),
  schema: baseSchema.extend({
    frequency: z.number().int().min(1).max(5),
    damage: z.number().int().min(1).max(5),
    departments: z.array(z.string()).default(['all']),
    escape: z.array(z.string()).default([]),
  }),
});

const glossary = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/glossary' }),
  schema: z.object({
    term: z.string(),
    reading: z.string().optional(),
    definition: z.string(),
    forbidden: z.array(z.string()).default([]), // 使用禁止の表記ゆれ
  }),
});

// 一次情報(sources/)。サイトには出典一覧として自動生成で出す
const sources = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './sources' }),
  schema: z.object({
    id: z.string(),
    url: z.string().url(),
    title: z.string(),
    publisher: z.string(),
    published: z.union([z.coerce.date(), z.literal('unknown')]),
    retrieved: z.coerce.date(),
    language: z.enum(['ja', 'en']),
    reliability: z.enum(['high', 'medium', 'low']),
    topics: z.array(z.string()).min(1),
    summary: z.string(),
    key_facts: z.array(z.string()).default([]),
    jp_note: z.string().optional(),
  }),
});

export const collections = {
  principles,
  readiness,
  organization,
  roadmap,
  departments,
  patterns,
  'anti-patterns': antiPatterns,
  glossary,
  sources,
};
