// ページ間リンクの検証: ①本文の参照記法 `編名「タイトル」` が実ページに解決できるか
// ②frontmatterのid参照(related/escape/departments/sources)が実在するか。
// 未解決があれば一覧を出して exit 1(公開ゲート)。
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildPageRegistry, slugInventory, SECTION_LABELS, REF_PATTERN } from '../src/lib/page-registry.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'src', 'content');
const registry = buildPageRegistry('/');
const inv = slugInventory();

let refCount = 0;
const errors = [];

function arrayField(fm, field) {
  const m = fm.match(new RegExp(`^${field}:\\s*\\[([^\\]]*)\\]`, 'm'));
  if (!m) return [];
  return m[1].split(',').map((s) => s.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
}

for (const dir of [...Object.keys(SECTION_LABELS), 'glossary']) {
  let files = [];
  try {
    files = readdirSync(join(CONTENT, dir)).filter((f) => /\.(md|mdx)$/.test(f));
  } catch { continue; }
  for (const f of files) {
    const path = `src/content/${dir}/${f}`;
    const text = readFileSync(join(CONTENT, dir, f), 'utf8');
    const fmMatch = text.match(/^---\n([\s\S]*?)\n---/);
    const fm = fmMatch ? fmMatch[1] : '';
    const body = text.slice(fmMatch ? fmMatch[0].length : 0);

    // ① 本文の参照記法
    REF_PATTERN.lastIndex = 0;
    for (const m of body.matchAll(REF_PATTERN)) {
      refCount++;
      if (!registry.has(m[0])) {
        const line = body.slice(0, m.index).split('\n').length + (fmMatch ? fmMatch[0].split('\n').length - 1 : 0);
        errors.push(`未解決の参照: ${path}:${line} 「${m[0]}」`);
      }
    }

    // ② frontmatterのid参照
    for (const id of arrayField(fm, 'sources')) {
      if (!inv.sources.has(id)) errors.push(`存在しないsource: ${path} → ${id}`);
    }
    for (const id of arrayField(fm, 'departments')) {
      if (id !== 'all' && !inv.departments.has(id)) errors.push(`存在しないdepartment: ${path} → ${id}`);
    }
    for (const id of arrayField(fm, 'related')) {
      if (!inv[dir]?.has(id)) errors.push(`存在しないrelated(同セクション内に必要): ${path} → ${id}`);
    }
    for (const id of arrayField(fm, 'escape')) {
      const anywhere = Object.values(inv).some((set) => set.has(id));
      if (!anywhere) errors.push(`存在しないescape先: ${path} → ${id}`);
    }
  }
}

for (const e of errors) console.error(`✗ ${e}`);
console.log(`参照記法 ${refCount}件 / エラー ${errors.length}件`);
process.exit(errors.length > 0 ? 1 : 0);
