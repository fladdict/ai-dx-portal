import { visit } from 'unist-util-visit';
import { renderMermaidSVG } from 'beautiful-mermaid';

// ```mermaid コードブロックをビルド時にSVGへ変換する。
// 構文エラーはビルドエラーとして落とす(不正な図を公開しないための品質ゲート)。
// 色はCSS変数で渡すため、サイトのライト/ダークモードに自動追従する。
export function remarkMermaid() {
  return (tree, file) => {
    visit(tree, 'code', (node, index, parent) => {
      if (node.lang !== 'mermaid' || !parent || index === undefined) return;
      let svg;
      try {
        // 注意: サイト側の --bg/--fg と同名を渡すと、SVGの style="--bg:var(--bg)" が
        // CSS変数の自己参照(循環)になり全色が無効=黒落ちする。別名を経由させる
        // (.diagram 側で --mermaid-bg/--mermaid-fg にサイト変数を橋渡しする)
        svg = renderMermaidSVG(node.value, {
          bg: 'var(--mermaid-bg, #ffffff)',
          fg: 'var(--mermaid-fg, #1a1a1a)',
          transparent: true,
          font: 'Hiragino Sans',
        });
      } catch (e) {
        throw new Error(
          `Mermaid図のレンダリングに失敗: ${file?.path ?? '(unknown file)'}\n${e.message}\n--- diagram ---\n${node.value}`
        );
      }
      parent.children[index] = {
        type: 'html',
        value: `<figure class="diagram">${svg}</figure>`,
      };
    });
  };
}
