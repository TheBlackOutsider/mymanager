from fastapi import FastAPI
from .auth_controller import auth_router

app = FastAPI(title="Auth Service", version="1.0.0")
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
