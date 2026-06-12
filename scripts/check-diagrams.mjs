// src/content/**/*.md(draft含む)の全mermaidブロックをレンダリング検証する。
// ビルドはpublishedページしかレンダリングしないため、draftの図はこのスクリプトで検証する。
import { readFileSync } from 'node:fs';
import { globSync } from 'node:fs';
import { renderMermaidSVG } from 'beautiful-mermaid';

const files = globSync('src/content/**/*.{md,mdx}');
let blocks = 0;
let errors = 0;

for (const file of files) {
  const text = readFileSync(file, 'utf8');
  const matches = text.matchAll(/```mermaid\n([\s\S]*?)```/g);
  for (const m of matches) {
    blocks++;
    try {
      renderMermaidSVG(m[1], { bg: '#fff', fg: '#222', transparent: true });
    } catch (e) {
      errors++;
      console.error(`✗ ${file}\n  ${e.message.split('\n')[0]}\n  --- diagram head: ${m[1].slice(0, 80).replace(/\n/g, ' / ')}`);
    }
  }
}

console.log(`mermaidブロック ${blocks}件中 エラー ${errors}件`);
process.exit(errors > 0 ? 1 : 0);
