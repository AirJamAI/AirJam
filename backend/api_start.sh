#!/bin/bash

# Activate virtualenv (redundant if PATH is already set, but good for clarity)
source /opt/venv/bin/activate

# Python deps
pip install -r requirements.txt

# Launch app
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
