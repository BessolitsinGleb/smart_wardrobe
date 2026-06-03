from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine
from app import models  # noqa: F401 — triggers table creation
from app.routers import users, clothes, outfits

models.Base.metadata.create_all(bind=engine)

Path("static/uploads").mkdir(parents=True, exist_ok=True)

app = FastAPI(title="Smart Wardrobe", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static: uploaded images
app.mount("/static", StaticFiles(directory="static"), name="static")

# API routers
app.include_router(users.router)
app.include_router(clothes.router)
app.include_router(outfits.router)


# ── Frontend ──────────────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
def serve_index():
    return FileResponse("frontend/index.html")


@app.get("/style.css", include_in_schema=False)
def serve_css():
    return FileResponse("frontend/style.css", media_type="text/css")


@app.get("/app.js", include_in_schema=False)
def serve_js():
    return FileResponse("frontend/app.js", media_type="application/javascript")


@app.get("/health")
def health():
    return {"status": "ok"}
