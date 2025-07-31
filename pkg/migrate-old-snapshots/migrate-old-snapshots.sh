#!/usr/bin/env sh

shas=$(git log --all --oneline --grep="^Update$" | cut -d ' ' -f 1)

mkdir -p /tmp/hov-commits

for sha in $shas; do
  echo "Migrating $sha"...
  filename="/tmp/hov-commits/$sha.md"
  git show "${sha}:README.md" | sed -n '/| Rank/,$p' >"$filename"
  npx mdt2json -f "$filename" -l AoS --include-html -k "$filename.out" >/dev/null
  date=$(git show "$sha" --summary --format="%ad")
  table=$(sed -n 's/```//;/\[/,$p' "$filename.out")
  printf "%s\n%s" "$date" "$table" | npm run migrate-single-snapshot
done

rm -rf /tmp/hov-commits
