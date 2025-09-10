from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import Optional, List
from .auth_service import AuthService
from shared.models.employee import EmployeeCreate, EmployeeResponse, UserRole

auth_router = APIRouter()
security = HTTPBearer()

class LoginRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    success: bool
    user: Optional[EmployeeResponse] = None
    token: Optional[str] = None
    refreshToken: Optional[str] = None
    permissions: List[str] = []
    message: Optional[str] = None

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

@auth_router.post("/login", response_model=ApiResponse)
async def login(request: LoginRequest):
    """Connexion utilisateur"""
    auth_service = AuthService()
    
    user = auth_service.authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    access_token = auth_service.create_access_token(data={"sub": str(user.id)})
    refresh_token = auth_service.create_refresh_token(data={"sub": str(user.id)})
    permissions = auth_service.get_default_permissions(user.role)
    
    return ApiResponse(
        success=True,
        message="Connexion réussie",
        data=AuthResponse(
            success=True,
            user=EmployeeResponse.from_orm(user),
            token=access_token,
            refreshToken=refresh_token,
            permissions=permissions,
            message="Authentification réussie"
        ).dict()
    )

@auth_router.post("/register", response_model=ApiResponse)
async def register(user_data: EmployeeCreate):
    """Inscription utilisateur"""
    auth_service = AuthService()
    
    try:
        user = auth_service.create_user(user_data.dict())
        return ApiResponse(
            success=True,
            message="Utilisateur créé avec succès",
            data=EmployeeResponse.from_orm(user).dict()
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création: {str(e)}")

@auth_router.get("/profile", response_model=ApiResponse)
async def get_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Récupération du profil utilisateur"""
    auth_service = AuthService()
    
    payload = auth_service.verify_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Token invalide")
    
    user = auth_service.get_user_by_id(payload.get("sub"))
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    return ApiResponse(
        success=True,
        message="Profil récupéré",
        data=EmployeeResponse.from_orm(user).dict()
    )