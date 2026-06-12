// 本文中のページ参照記法 `編名「タイトル」` を、ビルド時に実ページへのリンクに変換する。
// 執筆者はテキストを書くだけでよい(リンク切れはタイトル変更時も起きない——解決できない参照は
// テキストのまま残り、scripts/check-links.mjs が検出する)。
import { visit } from 'unist-util-visit';
import { buildPageRegistry, REF_PATTERN } from './page-registry.mjs';
import { SITE_BASE } from './site-config.mjs';

let registry; // プロセス内キャッシュ(devサーバーでページを増やしたら再起動が必要)

export function remarkAutolink() {
  return (tree) => {
    registry ??= buildPageRegistry(SITE_BASE);
    visit(tree, 'text', (node, index, parent) => {
      if (!parent || parent.type === 'link' || index === undefined) return;
      const value = node.value;
      REF_PATTERN.lastIndex = 0;
      if (!REF_PATTERN.test(value)) return;

      const children = [];
      let last = 0;
      REF_PATTERN.lastIndex = 0;
      for (const m of value.matchAll(REF_PATTERN)) {
        const hit = registry.get(m[0]);
        if (!hit) continue; // 未解決はテキストのまま(check:linksが報告)
        if (m.index > last) children.push({ type: 'text', value: value.slice(last, m.index) });
        children.push({ type: 'link', url: hit.href, children: [{ type: 'text', value: m[0] }] });
        last = m.index + m[0].length;
      }
      if (children.length === 0) return;
      if (last < value.length) children.push({ type: 'text', value: value.slice(last) });
      parent.children.splice(index, 1, ...children);
      return index + children.length;
    });
  };
}
