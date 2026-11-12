#!/usr/bin/env bash
# Merge a PR only after scripts/verify_site.py passed on that PR's exact head commit
# (Joona 2026-11-12: "we should always have a verification step before merging").
#
#   scripts/merge_pr.sh <pr-number>
#
# Workflow: check out the PR branch (clean tree) and run
#   python3 scripts/verify_site.py --runs 3
# (it serves the checkout itself on a free port and proves the pages it measures are this tree's)
# which writes .verify/<commit>.json. This script then merges only if that file exists for the PR's head commit,
# says ok=true and was made from a clean tree. Any new commit on the PR needs a new verify run.
set -euo pipefail
pr="${1:?usage: scripts/merge_pr.sh <pr-number>}"
root="$(git rev-parse --show-toplevel)"
head="$(gh pr view "$pr" --json headRefOid -q .headRefOid)"
report="$root/.verify/$head.json"
if [[ ! -f "$report" ]]; then
  echo "REFUSED: no verification for PR #$pr head ${head:0:7}. Check out the PR, then run: python3 scripts/verify_site.py" >&2
  exit 1
fi
ok="$(python3 -c 'import json,sys; r=json.load(open(sys.argv[1])); print("yes" if r.get("ok") and not r.get("dirty") and r.get("commit")==sys.argv[2] and r.get("identity")=="matched" else "no")' "$report" "$head")"
if [[ "$ok" != "yes" ]]; then
  echo "REFUSED: .verify/${head:0:7}.json is not a clean passing run for this commit:" >&2
  python3 -c 'import json,sys; r=json.load(open(sys.argv[1])); print(" dirty:", r.get("dirty"), " identity:", r.get("identity"), " fails:", r.get("fails"))' "$report" >&2
  exit 1
fi
echo "verified ${head:0:7}: merging PR #$pr"
gh pr merge "$pr" --merge
