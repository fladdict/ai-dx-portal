// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';

// GitHub Pages 公開設定:
// site はリポジトリ作成後に `https://<username>.github.io` へ差し替える
export default defineConfig({
  site: 'https://fladdict.github.io',
  // 末尾スラッシュ必須: BASE_URL が '/ai-dx-portal/' になり、`${base}xxx/` 形式のリンクが正しく組み立てられる
  base: '/ai-dx-portal/',
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkMermaid],
  },
});
