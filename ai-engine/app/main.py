"""
Absher Neuron 2.0 — AI Security Intelligence Engine (FastAPI)
Author: Abdulaziz AlAmawi

Exposes the predictive threat ensemble over REST and streams live, model-scored
security events over a native WebSocket gateway for the command center.
"""
from __future__ import annotations

import asyncio
import json

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from ml.engine import ENGINE, MODEL_VERSION
from ml.features import SessionFeatures, FEATURE_NAMES, THREAT_CLASSES
from .schemas import AssessRequest, AssessResponse, HealthResponse, MetricsResponse
from .stream import generate_event

app = FastAPI(
    title="Absher Neuron 2.0 — AI Security Intelligence Engine",
    description=(
        "Predictive identity-threat detection powered by an Isolation Forest + "
        "Random Forest + gradient-boosted ensemble. Behavioral biometrics, "
        "anomaly detection and adaptive risk-based authentication.\n\n"
        "**Owner:** Abdulaziz AlAmawi"
    ),
    version="2.0.0",
    contact={"name": "Abdulaziz AlAmawi"},
    license_info={"name": "MIT", "url": "https://opensource.org/licenses/MIT"},
    openapi_tags=[
        {"name": "Risk", "description": "Behavioral risk assessment & adaptive MFA."},
        {"name": "System", "description": "Health, model metadata & metrics."},
        {"name": "Realtime", "description": "Live security event stream (WebSocket)."},
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def _startup() -> None:
    # Train on first boot if artifacts are missing, then warm the engine.
    await asyncio.to_thread(ENGINE.ensure)


@app.get("/", tags=["System"])
async def root() -> dict:
    return {
        "service": "Absher Neuron 2.0 — AI Security Intelligence Engine",
        "owner": "Abdulaziz AlAmawi",
        "version": "2.0.0",
        "docs": "/docs",
        "endpoints": ["/health", "/assess", "/metrics", "/model", "/ws/stream"],
    }


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health() -> HealthResponse:
    return HealthResponse(
        status="operational",
        service="absher-neuron-ai-engine",
        version="2.0.0",
        owner="Abdulaziz AlAmawi",
        models_ready=ENGINE.ready,
    )


@app.get("/model", tags=["System"])
async def model_info() -> dict:
    ENGINE.ensure()
    return {
        "model_version": MODEL_VERSION,
        "features": FEATURE_NAMES,
        "classes": THREAT_CLASSES,
        "owner": "Abdulaziz AlAmawi",
    }


@app.get("/metrics", response_model=MetricsResponse, tags=["System"])
async def metrics() -> MetricsResponse:
    ENGINE.ensure()
    return MetricsResponse(metrics=ENGINE.metrics)


@app.post("/assess", response_model=AssessResponse, tags=["Risk"])
async def assess(req: AssessRequest) -> AssessResponse:
    feats = SessionFeatures(**req.model_dump())
    result = await asyncio.to_thread(ENGINE.assess, feats)
    return AssessResponse(**result)


@app.websocket("/ws/stream")
async def ws_stream(ws: WebSocket) -> None:
    """Live, model-scored threat event stream for the command center."""
    await ws.accept()
    try:
        while True:
            event = await asyncio.to_thread(generate_event)
            await ws.send_text(json.dumps(event))
            await asyncio.sleep(2.5)
    except WebSocketDisconnect:
        return
    except Exception:
        await ws.close()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
