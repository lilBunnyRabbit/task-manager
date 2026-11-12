#!/usr/bin/env bash
set -euo pipefail
dir=$(cd "$(dirname "$0")" && pwd)
src="file:///$(cygpath -m "$dir/og.html" 2>/dev/null || echo "${dir#/}/og.html")"
bunx playwright@1.48.2 screenshot --channel chrome --viewport-size 1200,630 --wait-for-timeout 1500 "$src" "$dir/../../public/og-image.png"
