import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, companies, issues, users

# Initialize the core FastAPI application instance
app = FastAPI(
    title="SyncNode API",
    description="Enterprise-grade backend for modern issue tracking and team collaboration.",
    version="1.0.0"
)

# Configure dynamic CORS origins for safe deployment and local development
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

# Register application routers with strict domain prefixes and OpenAPI tags
app.include_router(companies.router, prefix="/companies", tags=["Companies"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(issues.router, prefix="/issues", tags=["Issues"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])


@app.get("/")
def health_check():
    """
    Root endpoint serving as a system health check.
    Utilized by cloud load balancers and container orchestrators to verify service uptime.
    """
    return {
        "status": "ok", 
        "message": "SyncNode API is running optimally!",
        "version": "1.0.0"
    }