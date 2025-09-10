import logging
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from jose import JWTError, jwt
import os

logger = logging.getLogger(__name__)

class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware d'authentification pour l'API Gateway"""
    
    def __init__(self, app):
        super().__init__(app)
        self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key")
        self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.public_routes = [
            "/",
            "/health",
            "/api/auth/login",
            "/api/auth/register",
            "/docs",
            "/openapi.json"
        ]
    
    async def dispatch(self, request: Request, call_next):
        # Vérification des routes publiques
        if request.url.path in self.public_routes:
            return await call_next(request)
        
        # Extraction du token
        authorization = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Token d'authentification requis"}
            )
        
        token = authorization.split(" ")[1]
        
        try:
            # Vérification du token
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            user_id = payload.get("sub")
            
            if not user_id:
                return JSONResponse(
                    status_code=401,
                    content={"detail": "Token invalide"}
                )
            
            # Ajout de l'utilisateur dans les headers pour les microservices
            request.state.user_id = user_id
            request.state.user_payload = payload
            
        except JWTError:
            return JSONResponse(
                status_code=401,
                content={"detail": "Token invalide"}
            )
        
        return await call_next(request)

class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware de limitation de taux"""
    
    def __init__(self, app, calls_per_minute: int = 60):
        super().__init__(app)
        self.calls_per_minute = calls_per_minute
        self.requests = {}
    
    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = int(time.time())
        
        # Nettoyage des anciennes entrées
        if client_ip in self.requests:
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if current_time - req_time < 60
            ]
        else:
            self.requests[client_ip] = []
        
        # Vérification de la limite
        if len(self.requests[client_ip]) >= self.calls_per_minute:
            return JSONResponse(
                status_code=429,
                content={"detail": "Trop de requêtes"}
            )
        
        # Ajout de la requête actuelle
        self.requests[client_ip].append(current_time)
        
        return await call_next(request)

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware de logging des requêtes"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log de la requête entrante
        logger.info(f"Requête entrante: {request.method} {request.url.path}")
        
        response = await call_next(request)
        
        # Log de la réponse
        process_time = time.time() - start_time
        logger.info(f"Réponse: {response.status_code} - Temps: {process_time:.3f}s")
        
        return response
