// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import { remarkMermaid } from './src/lib/remark-mermaid.mjs';
import { remarkAutolink } from './src/lib/remark-autolink.mjs';
import { SITE_BASE } from './src/lib/site-config.mjs';

export default defineConfig({
  site: 'https://fladdict.github.io',
  // 末尾スラッシュ必須: BASE_URL が '/ai-dx-portal/' になり、`${base}xxx/` 形式のリンクが正しく組み立てられる
  base: SITE_BASE,
  integrations: [mdx()],
  markdown: {
    remarkPlugins: [remarkAutolink, remarkMermaid],
  },
});
