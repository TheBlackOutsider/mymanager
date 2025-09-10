import os
from typing import Optional

class Config:
    """Configuration de l'application HRlead"""
    
    # Configuration PostgreSQL
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:root@localhost:5432/hrlead"
    )
    
    # Configuration JWT
    JWT_SECRET_KEY: str = os.getenv(
        "JWT_SECRET_KEY", 
        "hrlead-super-secret-key-2024-change-in-production"
    )
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    
    # Configuration LDAP
    LDAP_ENABLED: bool = os.getenv("LDAP_ENABLED", "false").lower() == "true"
    LDAP_SERVER: str = os.getenv("LDAP_SERVER", "ldap://localhost")
    LDAP_PORT: int = int(os.getenv("LDAP_PORT", "389"))
    LDAP_BASE_DN: str = os.getenv("LDAP_BASE_DN", "dc=example,dc=com")
    LDAP_BIND_DN: str = os.getenv("LDAP_BIND_DN", "")
    LDAP_BIND_PASSWORD: str = os.getenv("LDAP_BIND_PASSWORD", "")
    LDAP_USER_SEARCH_BASE: str = os.getenv("LDAP_USER_SEARCH_BASE", "ou=users")
    LDAP_USER_SEARCH_FILTER: str = os.getenv("LDAP_USER_SEARCH_FILTER", "(uid={})")
    
    # Configuration Email
    EMAIL_ENABLED: bool = os.getenv("EMAIL_ENABLED", "false").lower() == "true"
    EMAIL_SMTP_SERVER: str = os.getenv("EMAIL_SMTP_SERVER", "smtp.gmail.com")
    EMAIL_SMTP_PORT: int = int(os.getenv("EMAIL_SMTP_PORT", "587"))
    EMAIL_USERNAME: str = os.getenv("EMAIL_USERNAME", "")
    EMAIL_PASSWORD: str = os.getenv("EMAIL_PASSWORD", "")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "")
    
    # Configuration Push Notifications
    PUSH_ENABLED: bool = os.getenv("PUSH_ENABLED", "false").lower() == "true"
    PUSH_VAPID_PUBLIC_KEY: str = os.getenv("PUSH_VAPID_PUBLIC_KEY", "")
    PUSH_VAPID_PRIVATE_KEY: str = os.getenv("PUSH_VAPID_PRIVATE_KEY", "")
    
    # Configuration SSO
    SSO_ENABLED: bool = os.getenv("SSO_ENABLED", "false").lower() == "true"
    SSO_PROVIDER: str = os.getenv("SSO_PROVIDER", "azure")
    SSO_CLIENT_ID: str = os.getenv("SSO_CLIENT_ID", "")
    SSO_CLIENT_SECRET: str = os.getenv("SSO_CLIENT_SECRET", "")
    SSO_TENANT_ID: str = os.getenv("SSO_TENANT_ID", "")
    
    # Configuration de l'application
    APP_NAME: str = "HRlead"
    APP_VERSION: str = "1.0.0"
    APP_DESCRIPTION: str = "Backend API for managing employees, HR events, leave requests, and reporting."
    
    # Configuration CORS
    CORS_ORIGINS: list = ["*"]  # En production, spécifier les origines réelles
    CORS_CREDENTIALS: bool = True
    CORS_METHODS: list = ["*"]
    CORS_HEADERS: list = ["*"]
    
    # Configuration de sécurité
    SECURITY_LEVEL: str = os.getenv("SECURITY_LEVEL", "medium")  # low, medium, high, critical
    RATE_LIMIT_ENABLED: bool = os.getenv("RATE_LIMIT_ENABLED", "true").lower() == "true"
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "3600"))  # 1 heure
    
    # Configuration des logs
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    
    @classmethod
    def get_database_url(cls) -> str:
        """Retourne l'URL de la base de données avec fallback SQLite"""
        if cls.DATABASE_URL.startswith("postgresql://"):
            # Ajout des paramètres d'encodage pour PostgreSQL
            return cls.DATABASE_URL
            # return cls.DATABASE_URL + "?client_encoding=utf8&options=-csearch_path%3Dpublic"
        else:
            # Fallback vers SQLite pour le développement
            return "sqlite:///./hrlead.db"
    
    @classmethod
    def is_production(cls) -> bool:
        """Détermine si l'environnement est en production"""
        return os.getenv("ENVIRONMENT", "development").lower() == "production"
    
    @classmethod
    def is_development(cls) -> bool:
        """Détermine si l'environnement est en développement"""
        return not cls.is_production()

# Instance globale de configuration
config = Config() 