#!/bin/sh
# Export the app icons from public/icons/icon.svg. Run by hand after changing
# the SVG; the PNGs are committed, so deploying needs none of these tools.
# Needs rsvg-convert (apt: librsvg2-bin) and optipng.
set -e
cd "$(dirname "$0")/../public/icons"
rsvg-convert -w 180 -h 180 icon.svg -o apple-touch-icon.png # iOS home screen
rsvg-convert -w 192 -h 192 icon.svg -o icon-192.png
rsvg-convert -w 512 -h 512 icon.svg -o icon-512.png
optipng -quiet -o7 apple-touch-icon.png icon-192.png icon-512.png
