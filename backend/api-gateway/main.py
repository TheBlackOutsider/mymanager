from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .gateway import Gateway
from .middleware import AuthMiddleware

app = FastAPI(
    title="HR Lead API Gateway",
    version="1.0.0",
    description="API Gateway pour les microservices HR Lead"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware d'authentification
app.add_middleware(AuthMiddleware)

# Initialisation du Gateway
gateway = Gateway()

# Routes du Gateway
@app.get("/")
async def root():
    return {"message": "HR Lead API Gateway", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "services": gateway.get_services_status()}

# Routes proxy vers les microservices
@app.api_route("/api/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_proxy(path: str, request):
    return await gateway.proxy_request("auth-service", path, request)

@app.api_route("/api/employees/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def employees_proxy(path: str, request):
    return await gateway.proxy_request("employee-service", path, request)

@app.api_route("/api/events/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def events_proxy(path: str, request):
    return await gateway.proxy_request("event-service", path, request)

@app.api_route("/api/leaves/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def leaves_proxy(path: str, request):
    return await gateway.proxy_request("leave-service", path, request)

@app.api_route("/api/notifications/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def notifications_proxy(path: str, request):
    return await gateway.proxy_request("notification-service", path, request)

@app.api_route("/api/reports/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def reports_proxy(path: str, request):
    return await gateway.proxy_request("report-service", path, request)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
