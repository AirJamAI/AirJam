# Use slim Python base
FROM python:3.12-slim

# Install system dependencies needed by OpenCV
RUN apt-get update && apt-get install -y \
  libgl1 \
  libglib2.0-0 \
  wget \
  curl \
  build-essential \
  && rm -rf /var/lib/apt/lists/*

# Set work directory
WORKDIR /app

# Copy requirements and install them into a virtualenv
COPY requirements.txt .

# Create a virtual environment
RUN python -m venv /opt/venv

# Activate venv and install Python packages
RUN . /opt/venv/bin/activate && pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Make the virtual environment available on PATH
ENV PATH="/opt/venv/bin:$PATH"

# Make sure api_start.sh is executable
RUN chmod +x api_start.sh

# Expose FastAPI default port
EXPOSE 8000

# Entrypoint: run your start script
CMD ["./api_start.sh"]
