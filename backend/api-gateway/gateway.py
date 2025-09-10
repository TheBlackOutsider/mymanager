import httpx
import logging
from typing import Dict, Any
from fastapi import Request, HTTPException

logger = logging.getLogger(__name__)

class Gateway:
    """API Gateway pour orchestrer les microservices"""
    
    def __init__(self):
        self.servces = {
            "auth-service": "http://localhost:8001",
            "employee-service": "http://localhost:8002",
            "event-service": "http://localhost:8003",
            "leave-service": "http://localhost:8004",
            "notification-service": "http://localhost:8005",
            "report-service": "http://localhost:8006"
        }
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def proxy_request(self, service_name: str, path: str, request: Request) -> Dict[str, Any]:
        """Proxy des requêtes vers les microservices"""
        if service_name not in self.services:
            raise HTTPException(status_code=404, detail=f"Service {service_name} non trouvé")
        
        service_url = self.services[service_name]
        url = f"{service_url}/api/{service_name.replace('-service', '')}/{path}"
        
        try:
            # Préparation des headers
            headers = dict(request.headers)
            headers.pop("host", None)
            
            # Préparation du body
            body = None
            if request.method in ["POST", "PUT", "PATCH"]:
                body = await request.body()
            
            # Envoi de la requête
            response = await self.client.request(
                method=request.method,
                url=url,
                headers=headers,
                params=request.query_params,
                content=body
            )
            
            return response.json()
            
        except httpx.TimeoutException:
            logger.error(f"Timeout lors de la requête vers {service_name}")
            raise HTTPException(status_code=504, detail="Service temporairement indisponible")
        
        except httpx.ConnectError:
            logger.error(f"Impossible de se connecter au service {service_name}")
            raise HTTPException(status_code=503, detail="Service indisponible")
        
        except Exception as e:
            logger.error(f"Erreur lors de la requête vers {service_name}: {str(e)}")
            raise HTTPException(status_code=500, detail="Erreur interne du serveur")
    
    def get_services_status(self) -> Dict[str, str]:
        """Vérification du statut des services"""
        status = {}
        for service_name, service_url in self.services.items():
            try:
                # Test de connectivité simple
                response = httpx.get(f"{service_url}/health", timeout=5.0)
                status[service_name] = "healthy" if response.status_code == 200 else "unhealthy"
            except:
                status[service_name] = "unavailable"
        
        return status
    
    async def close(self):
        """Fermeture du client HTTP"""
        await self.client.aclose()
