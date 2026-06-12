// ページ台帳: 本文中の参照記法 `編名「タイトル」` を実ページのURLに解決する。
// remark-autolink(自動リンク化)と scripts/check-links.mjs(検証)の共通基盤。
import { readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT = join(ROOT, 'src', 'content');

export const SECTION_LABELS = {
  principles: '原理編',
  readiness: 'AI-Ready編',
  organization: '組織・人材編',
  roadmap: 'ロードマップ編',
  departments: '部門別ガイド',
  patterns: '業務パターン集',
  'anti-patterns': 'アンチパターン集',
};

// 参照記法: 編名「タイトル」(タイトルは「 — 」より前の短縮形でも全体でも可)
export const REF_PATTERN =
  /(原理編|AI-Ready編|組織・人材編|ロードマップ編|部門別ガイド|業務パターン集|アンチパターン集|用語集)「([^」]+)」/g;

function frontmatterField(text, field) {
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) return null;
  const m = fm[1].match(new RegExp(`^${field}:\\s*(.+)$`, 'm'));
  return m ? m[1].trim().replace(/^['"]|['"]$/g, '') : null;
}

function contentFiles(dir) {
  try {
    return readdirSync(join(CONTENT, dir)).filter((f) => /\.(md|mdx)$/.test(f));
  } catch {
    return [];
  }
}

// 戻り値: Map<参照文字列, {href, title, section, slug}>
export function buildPageRegistry(base) {
  const refs = new Map();
  for (const [dir, label] of Object.entries(SECTION_LABELS)) {
    for (const f of contentFiles(dir)) {
      const slug = f.replace(/\.(md|mdx)$/, '');
      const title = frontmatterField(readFileSync(join(CONTENT, dir, f), 'utf8'), 'title');
      if (!title) continue;
      const short = title.split(/\s*—\s*/)[0].trim();
      const entry = { href: `${base}${dir}/${slug}/`, title, section: dir, slug };
      refs.set(`${label}「${short}」`, entry);
      refs.set(`${label}「${title}」`, entry);
    }
  }
  // 用語集は個別ページがないため、一覧ページのアンカーへ解決する
  for (const f of contentFiles('glossary')) {
    const slug = f.replace(/\.(md|mdx)$/, '');
    const term = frontmatterField(readFileSync(join(CONTENT, 'glossary', f), 'utf8'), 'term');
    if (term)
      refs.set(`用語集「${term}」`, {
        // 用語集ページのアンカーは id={用語そのもの}(src/pages/glossary/index.astro)
        href: `${base}glossary/#${term}`,
        title: term,
        section: 'glossary',
        slug,
      });
  }
  return refs;
}

// frontmatterのid参照検証用: 各ディレクトリの実在slug一覧
export function slugInventory() {
  const inv = {};
  for (const dir of [...Object.keys(SECTION_LABELS), 'glossary']) {
    inv[dir] = new Set(contentFiles(dir).map((f) => f.replace(/\.(md|mdx)$/, '')));
  }
  inv.sources = new Set(
    readdirSync(join(ROOT, 'sources'))
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''))
  );
  return inv;
}
