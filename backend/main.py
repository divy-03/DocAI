from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, projects, generation, refinement, export
from config import get_settings

settings = get_settings()

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Document Platform API",
    description="API for AI-assisted document authoring and generation",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.client_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(generation.router)
app.include_router(refinement.router)
app.include_router(export.router)

@app.get("/")
async def root():
    return {"message": "AI Document API", "status": "active", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

