from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Document Platform API",
    description="API for AI-assisted document authoring and generation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "AI Document API", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

