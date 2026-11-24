#!/bin/sh
# Shrink a reel for the website before adding it to data/work.ts.
# 720x1280, 30 fps, H.264 with "fast start" (the phone can begin playing before the whole file has downloaded).
# Usage: sh scripts/compress-reel.sh input.mp4 my-reel-id
#        -> public/work/reels/my-reel-id.mp4, then set  video: "/work/reels/my-reel-id.mp4"
# Needs ffmpeg. If it is not on PATH, point to it: FFMPEG=/path/to/ffmpeg sh scripts/compress-reel.sh ...
set -e
[ $# -eq 2 ] || { echo "Usage: sh scripts/compress-reel.sh input.mp4 reel-id"; exit 1; }
mkdir -p public/work/reels
"${FFMPEG:-ffmpeg}" -hide_banner -loglevel error -y -i "$1" \
  -vf "scale=720:1280:force_original_aspect_ratio=decrease,pad=720:1280:(ow-iw)/2:(oh-ih)/2,fps=30" \
  -c:v libx264 -preset slow -crf 23 -maxrate 2500k -bufsize 5000k -profile:v high -level 4.0 -pix_fmt yuv420p \
  -c:a aac -b:a 128k -ac 2 -movflags +faststart "public/work/reels/$2.mp4"
ls -lh "public/work/reels/$2.mp4"
