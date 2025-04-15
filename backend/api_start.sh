#!/bin/bash

echo "🔍 Checking libGL.so.1"
find /nix -name "libGL.so.1" || echo "libGL.so.1 not found"

# Python deps
pip install -r requirements.txt

# Launch app
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
