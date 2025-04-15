#!/bin/bash

# Install libGL and other missing system dependencies
apt-get update && apt-get install -y libgl1 libglib2.0-0 || true

# Install Python dependencies
pip install -r requirements.txt

# Start the app
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
