# 1. Base Image: Use the official lightweight Python 3.11 image.
# The 'slim' tag strips out unnecessary OS packages to keep the final file size tiny.
FROM python:3.11-slim

# 2. Environment Variables: Standard Python Docker configurations.
# Prevents Python from writing useless .pyc files to disk.
ENV PYTHONDONTWRITEBYTECODE=1
# Ensures console output is not buffered by Docker (makes terminal logs appear instantly).
ENV PYTHONUNBUFFERED=1

# 3. Work Directory: Set the default folder inside the container.
# All subsequent commands (COPY, RUN, CMD) will execute inside this folder.
WORKDIR /app

# 4. Dependency Caching: Copy ONLY the requirements file first.
# Docker builds in "layers". By doing this first, Docker memorizes your installed packages.
# If you only change your Python code later, Docker skips the 60-second pip install step and rebuilds instantly!
COPY requirements.txt .

# 5. Install Dependencies: Install the Python packages.
# '--no-cache-dir' prevents pip from saving the downloaded installation zip files, keeping the image small.
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copy Source Code: Move the rest of your backend code into the container.
COPY . .

# 7. Expose Port: Tell Docker which port the application listens on.
# (Note: This is just documentation for other developers; the 'docker run -p' command actually opens it).
EXPOSE 8000

# 8. Start Command: The exact command to spin up the FastAPI ASGI server.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]