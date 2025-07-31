#!/usr/bin/env sh

shas=$(git log --all --oneline --grep="^Update$" | cut -d ' ' -f 1)

mkdir -p /tmp/hov-commits

for sha in $shas; do
  echo "$sha"
  filename="/tmp/hov-commits/$sha.md"
  git show "${sha}:README.md" | sed -n '/| Rank/,$p' >"$filename"
  npx mdt2json -f "$filename" -l AoS --include-html -k "$filename.out"
  sed -n 's/```//;/\[/,$p' "$filename.out" | npm run migrate-single-snapshot
  exit 1
done

rm -rf /tmp/hov-commits
