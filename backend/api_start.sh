#!/bin/bash

# Install Python dependencies
pip install -r requirements.txt

# Start the app
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
