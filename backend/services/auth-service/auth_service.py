import os
import logging
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from shared.database.connection import DatabaseConnection
from shared.models.employee import Employee, UserRole

logger = logging.getLogger(__name__)

class AuthService:
    """Service d'authentification avec pattern Singleton"""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AuthService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            self.secret_key = os.getenv("JWT_SECRET_KEY", "your-secret-key")
            self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")
            self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
            self.db_connection = DatabaseConnection()
            self._initialized = True
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Vérification du mot de passe"""
        return self.pwd_context.verify(plain_password, hashed_password)
    
    def get_password_hash(self, password: str) -> str:
        """Hashage du mot de passe"""
        return self.pwd_context.hash(password)
    
    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Création du token d'accès"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=self.access_token_expire_minutes)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def create_refresh_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Création du refresh token"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=7)
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, self.secret_key, algorithm=self.algorithm)
        return encoded_jwt
    
    def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Vérification du token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=[self.algorithm])
            return payload
        except JWTError:
            return None
    
    def authenticate_user(self, email: str, password: str) -> Optional[Employee]:
        """Authentification utilisateur"""
        db = self.db_connection.get_session()
        try:
            user = db.query(Employee).filter(Employee.email == email).first()
            if user and self.verify_password(password, user.password_hash):
                return user
            return None
        finally:
            db.close()
    
    def get_user_by_id(self, user_id: str) -> Optional[Employee]:
        """Récupération utilisateur par ID"""
        db = self.db_connection.get_session()
        try:
            return db.query(Employee).filter(Employee.id == user_id).first()
        finally:
            db.close()
    
    def create_user(self, user_data: dict) -> Employee:
        """Création d'un nouvel utilisateur"""
        db = self.db_connection.get_session()
        try:
            hashed_password = self.get_password_hash(user_data["password"])
            user = Employee(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=hashed_password,
                role=user_data.get("role", UserRole.employee),
                department=user_data["department"],
                job_title=user_data["job_title"],
                seniority=user_data["seniority"],
                avatar=user_data.get("avatar")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            return user
        finally:
            db.close()
    
    def get_default_permissions(self, role: UserRole) -> list:
        """Récupération des permissions par défaut selon le rôle"""
        permissions = {
            UserRole.employee: ["read:own_profile", "read:own_leaves", "read:events"],
            UserRole.manager: ["read:own_profile", "read:own_leaves", "read:events", "approve:team_leaves"],
            UserRole.hr_officer: ["read:employees", "read:leaves", "read:events", "create:events", "approve:leaves"],
            UserRole.hr_head: ["*"]  # Toutes les permissions
        }
        return permissions.get(role, [])
    
    def has_permission(self, user: Employee, resource: str, action: str, scope: str = "self") -> bool:
        """Vérification des permissions utilisateur"""
        permissions = self.get_default_permissions(user.role)
        
        # Permission globale
        if "*" in permissions:
            return True
        
        # Permission spécifique
        permission_key = f"{action}:{resource}"
        if permission_key in permissions:
            return True
        
        # Permission avec scope
        scoped_permission = f"{action}:{resource}:{scope}"
        if scoped_permission in permissions:
            return True
        
        return False