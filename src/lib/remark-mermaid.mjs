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
        svg = renderMermaidSVG(node.value, {
          bg: 'var(--bg)',
          fg: 'var(--fg)',
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
