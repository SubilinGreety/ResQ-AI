import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables (.env from server or local)
load_dotenv()
load_dotenv("../server/.env")

from api.routes import router as climate_router
from api.coordinator_routes import router as coordinator_router

app = FastAPI(
    title="ResQ AI - Central Intelligence & Multi-Agent Response Platform",
    description="Multi-Agent Disaster Response Coordinator, Autonomous AI Orchestration, Climate Telemetry, and Early Warning Dispatch.",
    version="2.0.0"
)

# Enable CORS for ResQ AI Frontend & Express Server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(climate_router)
app.include_router(coordinator_router)

@app.get("/")
def root():
    return {
        "service": "ResQ AI Climate Intelligence & Early Warning System",
        "module": "Module 5",
        "status": "ONLINE",
        "docs_url": "/docs",
        "api_prefix": "/api/climate"
    }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "climate-intelligence-fastapi"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8008, reload=True)
