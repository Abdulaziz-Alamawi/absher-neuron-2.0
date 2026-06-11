# Absher Neuron 2.0 — AI Engine image
# Author: Abdulaziz AlAmawi
FROM python:3.12-slim AS base

LABEL org.opencontainers.image.title="Absher Neuron AI Engine"
LABEL org.opencontainers.image.authors="Abdulaziz AlAmawi"
LABEL org.opencontainers.image.version="2.0.0"

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

# Pre-train the ensemble at build time so the image ships ready-to-serve.
RUN python -m ml.train

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:8000/health || exit 1

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
