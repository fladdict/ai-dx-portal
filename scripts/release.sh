#!/bin/bash
# 公開リポジトリ(fladdict/ai-dx-portal)へのリリーススクリプト — orphanブランチ方式
# ローカルmain(全履歴・運営ファイル込み)から、公開対象のみを release ブランチに乗せて push する。
# 非公開: .claude/ CLAUDE.md docs/ README.md(企画版) README.public.md
# 注意: main がクリーン(未コミットなし)であること。公開READMEは README.public.md を編集する。
set -euo pipefail

cd "$(dirname "$0")/.."

if [ -n "$(git status --porcelain)" ]; then
  echo "エラー: 未コミットの変更があります。コミットしてから実行してください" >&2
  exit 1
fi

git checkout release
# 公開対象をmainの最新で上書き(削除も反映するため一旦インデックスを同期)
git checkout main -- .github .gitignore CHANGELOG.md astro.config.mjs package.json package-lock.json scripts sources src README.public.md
cp README.public.md README.md
git rm -q --cached README.public.md || true
rm README.public.md
git add -A
if git diff --cached --quiet; then
  echo "変更なし。リリース不要"
else
  git commit -m "release: $(date +%Y-%m-%d)"
  git push public release:main
fi
git checkout -f main
echo "done. main に戻りました"
