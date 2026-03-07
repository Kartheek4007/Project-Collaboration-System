from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, companies, projects, tasks, collaboration, deliverables

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Multi-Company Project Collaboration System")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(collaboration.router)
app.include_router(deliverables.router)

@app.get("/")
def root():
    return {"message": "Welcome to the Multi-Company Project Collaboration System API"}
