#!/bin/bash
# 公開リポジトリへのリリーススクリプト
# ローカルrepo(全履歴・運営ファイル込み)から、公開対象ファイルのみのスナップショットを
# fladdict/ai-dx-portal へ単一コミットとして force push する。
# 非公開: .claude/ CLAUDE.md docs/ README.md(企画版) .git node_modules dist .astro
set -euo pipefail

SRC="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="https://github.com/fladdict/ai-dx-portal.git"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

rsync -a \
  --exclude '.git' \
  --exclude '.claude' \
  --exclude 'CLAUDE.md' \
  --exclude 'docs' \
  --exclude 'README.md' \
  --exclude 'README.public.md' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude '.astro' \
  --exclude '.DS_Store' \
  "$SRC/" "$TMP/"

cp "$SRC/README.public.md" "$TMP/README.md"

cd "$TMP"
git init -q -b main
git config user.email "fukatsu@gmail.com"
git config user.name "fladdict"
git add -A
git commit -q -m "release: $(date +%Y-%m-%d)"
git push -f "$REMOTE" main

echo "released: $(git rev-parse --short HEAD) -> $REMOTE"
