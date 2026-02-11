#!/bin/bash
# Launch Chrome with WebGL enabled on VirtualBox

google-chrome \
  --disable-gpu-driver-bug-workarounds \
  --ignore-gpu-blacklist \
  --enable-webgl \
  --enable-webgl2 \
  --use-gl=swiftshader \
  --disable-gpu-sandbox \
  --no-sandbox \
  --disable-features=VizDisplayCompositor \
  http://localhost:5173
