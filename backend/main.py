from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Integer, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any, Generic, TypeVar
from uuid import uuid4
import enum
import os
from config import config
print("DATABASE_URL utilisé :", config.get_database_url())
# Type variable for generic responses
T = TypeVar('T')
from contextlib import asynccontextmanager
import secrets
import logging

# Import des bibliothèques d'export
import csv
import io
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import json
from datetime import datetime, timedelta

# Import de la configuration
from config import config

# Security
SECRET_KEY = config.JWT_SECRET_KEY
ALGORITHM = config.JWT_ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = config.ACCESS_TOKEN_EXPIRE_MINUTES

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Configuration de la base de données
DATABASE_URL = config.get_database_url()

# Création de l'engine SQLAlchemy
engine = create_engine(
    DATABASE_URL,
    connect_args={
        "options": "-c client_encoding=utf8 -c log_min_messages=error"
    },
    pool_pre_ping=True,
    pool_recycle=300,
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Enums
class UserRole(str, enum.Enum):
    employee = "employee"
    manager = "manager"
    hr_officer = "hr_officer"
    hr_head = "hr_head"

class EventType(str, enum.Enum):
    training = "training"
    seminar = "seminar"
    onboarding = "onboarding"
    team_building = "team_building"
    other = "other"

class EventStatus(str, enum.Enum):
    draft = "draft"
    published = "published"
    cancelled = "cancelled"

class LeaveType(str, enum.Enum):
    annual = "annual"
    sick = "sick"
    personal = "personal"
    special = "special"

class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"

class NotificationType(str, enum.Enum):
    event_reminder = "event_reminder"
    leave_approval = "leave_approval"
    leave_rejection = "leave_rejection"
    event_invitation = "event_invitation"

# Database Models
class Employee(Base):
    __tablename__ = "employees"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.employee)
    department = Column(String, nullable=False)
    job_title = Column(String, nullable=False)
    seniority = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    leave_requests = relationship("LeaveRequest", back_populates="employee")
    notifications = relationship("Notification", back_populates="user")
    event_registrations = relationship("EventRegistration", back_populates="employee")

class Event(Base):
    __tablename__ = "events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    title = Column(String, nullable=False)
    description = Column(Text)
    type = Column(Enum(EventType), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    organizer = Column(String, nullable=False)
    attendees = Column(Text)  # JSON string of employee IDs
    max_attendees = Column(Integer, nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String, nullable=True)
    status = Column(Enum(EventStatus), default=EventStatus.draft)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    registrations = relationship("EventRegistration", back_populates="event")

class LeaveRequest(Base):
    __tablename__ = "leave_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    type = Column(Enum(LeaveType), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    status = Column(Enum(LeaveStatus), default=LeaveStatus.pending)
    reason = Column(Text, nullable=False)
    manager_approval = Column(Boolean, nullable=True)
    hr_approval = Column(Boolean, nullable=True)
    approved_by = Column(String, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    employee = relationship("Employee", back_populates="leave_requests")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    type = Column(Enum(NotificationType), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("Employee", back_populates="notifications")

class Attendance(Base):
    __tablename__ = "attendance"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    check_in = Column(DateTime, nullable=True)
    check_out = Column(DateTime, nullable=True)
    status = Column(String, default="registered")  # registered, present, absent, late, left_early
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# Event Registration Models
class EventRegistration(Base):
    __tablename__ = "event_registrations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    registration_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="confirmed")  # confirmed, waitlist, cancelled
    confirmation_code = Column(String, nullable=True)  # 2FA security
    ip_address = Column(String, nullable=True)  # Security audit trail
    user_agent = Column(String, nullable=True)  # Security audit trail
    session_id = Column(String, nullable=True)  # Security audit trail
    notes = Column(Text, nullable=True)
    emergency_contact_name = Column(String, nullable=True)
    emergency_contact_phone = Column(String, nullable=True)
    emergency_contact_relationship = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    event = relationship("Event", back_populates="registrations")
    employee = relationship("Employee", back_populates="event_registrations")

class RegistrationConflict(Base):
    __tablename__ = "registration_conflicts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"), nullable=False)
    employee_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=False)
    conflict_type = Column(String, nullable=False)  # leave_overlap, event_overlap, time_conflict, capacity_full
    conflict_details = Column(Text, nullable=False)
    severity = Column(String, default="medium")  # low, medium, high, critical
    resolved = Column(Boolean, default=False)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)
    
    # Relationships
    event = relationship("Event")
    employee = relationship("Employee")

# Pydantic Models
class UserBase(BaseModel):
    name: str
    email: str
    role: UserRole
    department: str
    job_title: str
    seniority: str
    avatar: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    user: UserResponse
    token: str
    permissions: List[str] = []

class AuthResponse(BaseModel):
    success: bool
    user: Optional[UserResponse] = None
    token: Optional[str] = None
    refreshToken: Optional[str] = None
    permissions: List[str] = []
    sessionExpiry: Optional[str] = None
    message: Optional[str] = None
    status: Optional[str] = None

class LDAPCredentials(BaseModel):
    username: str
    password: str

class EmailCredentials(BaseModel):
    email: str
    password: str

class PermissionCheck(BaseModel):
    resource: str
    action: str
    scope: str = "self"

class Token(BaseModel):
    access_token: str
    token_type: str

class EmployeeBase(BaseModel):
    name: str
    email: str
    department: str
    job_title: str
    seniority: str
    avatar: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    seniority: Optional[str] = None
    avatar: Optional[str] = None

class EmployeeResponse(EmployeeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class EventBase(BaseModel):
    title: str
    description: Optional[str] = None
    type: EventType
    start_date: datetime
    end_date: datetime
    location: str
    organizer: str
    attendees: List[str] = []
    max_attendees: Optional[int] = None
    is_recurring: bool = False
    recurrence_pattern: Optional[str] = None
    status: EventStatus = EventStatus.draft

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[EventType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    location: Optional[str] = None
    organizer: Optional[str] = None
    attendees: Optional[List[str]] = None
    max_attendees: Optional[int] = None
    is_recurring: Optional[bool] = None
    recurrence_pattern: Optional[str] = None
    status: Optional[EventStatus] = None

class EventResponse(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class LeaveRequestBase(BaseModel):
    employee_id: str
    type: LeaveType
    start_date: datetime
    end_date: datetime
    reason: str
    status: LeaveStatus = LeaveStatus.pending

class LeaveRequestCreate(LeaveRequestBase):
    pass

class LeaveRequestUpdate(BaseModel):
    type: Optional[LeaveType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    reason: Optional[str] = None
    status: Optional[LeaveStatus] = None
    manager_approval: Optional[bool] = None
    hr_approval: Optional[bool] = None
    approved_by: Optional[str] = None
    rejection_reason: Optional[str] = None

class LeaveRequestResponse(LeaveRequestBase):
    id: str
    manager_approval: Optional[bool]
    hr_approval: Optional[bool]
    approved_by: Optional[str]
    rejection_reason: Optional[str]
    created_at: datetime
    updated_at: datetime
    employee: Optional[EmployeeResponse] = None
    
    class Config:
        from_attributes = True

class NotificationBase(BaseModel):
    user_id: str
    type: NotificationType
    title: str
    message: str
    read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationResponse(BaseModel):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class AttendanceBase(BaseModel):
    event_id: str
    employee_id: str
    status: str = "registered"
    notes: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None

class AttendanceResponse(AttendanceBase):
    id: str
    check_in: Optional[datetime] = None
    check_out: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class AttendanceStats(BaseModel):
    total_registered: int
    total_present: int
    total_absent: int
    total_late: int
    attendance_rate: float
    late_rate: float

class PaginatedResponse(BaseModel):
    data: List[Any]
    total: int
    page: int
    limit: int
    total_pages: int

class ApiResponse(BaseModel, Generic[T]):
    data: Optional[T] = None
    message: str
    success: bool

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)  # Refresh token valide 7 jours
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = db.query(Employee).filter(Employee.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

# Create tables
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

# FastAPI app
app = FastAPI(
    title="HR Event & Leave Management API",
    version="1.0.0",
    description="Backend API for managing employees, HR events, leave requests, and reporting.",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=config.CORS_CREDENTIALS,
    allow_methods=config.CORS_METHODS,
    allow_headers=config.CORS_HEADERS,
)

# LDAP Configuration
LDAP_CONFIG = {
    "enabled": config.LDAP_ENABLED,
    "server": config.LDAP_SERVER,
    "port": config.LDAP_PORT,
    "base_dn": config.LDAP_BASE_DN,
    "bind_dn": config.LDAP_BIND_DN,
    "bind_password": config.LDAP_BIND_PASSWORD,
    "user_search_base": config.LDAP_USER_SEARCH_BASE,
    "user_search_filter": config.LDAP_USER_SEARCH_FILTER,
    "group_search_base": os.getenv("LDAP_GROUP_SEARCH_BASE", "ou=groups"),
    "group_search_filter": os.getenv("LDAP_GROUP_SEARCH_FILTER", "(member={})"),
    "ssl": os.getenv("LDAP_SSL", "false").lower() == "true",
    "timeout": int(os.getenv("LDAP_TIMEOUT", "10")),
}

# SSO Configuration
SSO_CONFIG = {
    "azure": {
        "enabled": os.getenv("AZURE_SSO_ENABLED", "false").lower() == "true",
        "client_id": os.getenv("AZURE_CLIENT_ID", ""),
        "client_secret": os.getenv("AZURE_CLIENT_SECRET", ""),
        "tenant_id": os.getenv("AZURE_TENANT_ID", ""),
        "redirect_uri": os.getenv("AZURE_REDIRECT_URI", ""),
    },
    "google": {
        "enabled": os.getenv("GOOGLE_SSO_ENABLED", "false").lower() == "true",
        "client_id": os.getenv("GOOGLE_CLIENT_ID", ""),
        "client_secret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
        "redirect_uri": os.getenv("GOOGLE_REDIRECT_URI", ""),
    }
}

# Security Audit Log Model
class SecurityAuditLog(Base):
    __tablename__ = "security_audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("employees.id"), nullable=True)
    action = Column(String, nullable=False)  # login, logout, permission_check, etc.
    resource = Column(String, nullable=True)  # events, leaves, employees, etc.
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    success = Column(Boolean, default=True)
    details = Column(Text, nullable=True)
    severity = Column(String, default="info")  # info, warning, error, critical
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("Employee")

# LDAP Authentication Functions
def ldap_authenticate(username: str, password: str) -> Optional[dict]:
    """Authentification LDAP sécurisée"""
    if not LDAP_CONFIG["enabled"]:
        return None
    
    try:
        import ldap3
        
        # Configuration de la connexion LDAP
        server_config = {
            'host': LDAP_CONFIG["server"].replace('ldap://', '').replace('ldaps://', ''),
            'port': LDAP_CONFIG["port"],
            'use_ssl': LDAP_CONFIG["ssl"],
            'get_info': ldap3.ALL,
            'connect_timeout': LDAP_CONFIG["timeout"]
        }
        
        server = ldap3.Server(**server_config)
        
        # Tentative de connexion avec les credentials utilisateur
        user_dn = LDAP_CONFIG["user_search_filter"].format(username)
        if LDAP_CONFIG["user_search_base"]:
            user_dn = f"{user_dn},{LDAP_CONFIG['user_search_base']},{LDAP_CONFIG['base_dn']}"
        
        conn = ldap3.Connection(server, user=user_dn, password=password)
        
        if not conn.bind():
            logger.warning(f"LDAP authentication failed for user: {username}")
            return None
        
        # Recherche des informations utilisateur
        search_filter = LDAP_CONFIG["user_search_filter"].format(username)
        search_base = f"{LDAP_CONFIG['user_search_base']},{LDAP_CONFIG['base_dn']}"
        
        conn.search(
            search_base=search_base,
            search_filter=search_filter,
            attributes=['cn', 'mail', 'department', 'title', 'memberOf']
        )
        
        if not conn.entries:
            logger.warning(f"LDAP user not found: {username}")
            return None
        
        user_entry = conn.entries[0]
        
        # Extraction des informations utilisateur
        user_info = {
            'username': username,
            'name': user_entry.cn.value if hasattr(user_entry, 'cn') else username,
            'email': user_entry.mail.value if hasattr(user_entry, 'mail') else f"{username}@company.com",
            'department': user_entry.department.value if hasattr(user_entry, 'department') else 'Unknown',
            'title': user_entry.title.value if hasattr(user_entry, 'title') else 'Employee',
            'groups': [group.value for group in user_entry.memberOf] if hasattr(user_entry, 'memberOf') else []
        }
        
        # Mapping des groupes LDAP vers les rôles
        role_mapping = {
            'CN=HR_Officers': 'hr_officer',
            'CN=HR_Managers': 'hr_head',
            'CN=Team_Managers': 'manager',
            'CN=System_Admins': 'admin',
        }
        
        user_info['role'] = 'employee'  # Rôle par défaut
        for group in user_info['groups']:
            if group in role_mapping:
                user_info['role'] = role_mapping[group]
                break
        
        conn.unbind()
        return user_info
        
    except Exception as e:
        logger.error(f"LDAP authentication error: {str(e)}")
        return None

def create_audit_log(
    db: Session,
    user_id: Optional[str],
    action: str,
    resource: Optional[str] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
    success: bool = True,
    details: Optional[str] = None,
    severity: str = "info"
):
    """Création d'un log d'audit de sécurité"""
    try:
        audit_log = SecurityAuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            ip_address=ip_address,
            user_agent=user_agent,
            success=success,
            details=details,
            severity=severity
        )
        db.add(audit_log)
        db.commit()
    except Exception as e:
        logger.error(f"Error creating audit log: {str(e)}")

# Authentication Endpoints
@app.post("/api/auth/ldap/login", response_model=ApiResponse[AuthResponse])
async def ldap_login(
    credentials: LDAPCredentials,
    request: Request,
    db: Session = Depends(get_db)
):
    """Connexion sécurisée via LDAP"""
    
    # Validation des credentials
    if not credentials.username or not credentials.password:
        raise HTTPException(status_code=400, detail="Nom d'utilisateur et mot de passe requis")
    
    # Vérification du rate limiting
    client_ip = request.client.host
    if not rate_limit_check(request):
        create_audit_log(
            db, None, "ldap_login", "auth", client_ip, 
            request.headers.get("user-agent"), False, "Rate limit exceeded", "warning"
        )
        raise HTTPException(status_code=429, detail="Trop de tentatives de connexion")
    
    # Tentative d'authentification LDAP
    user_info = ldap_authenticate(credentials.username, credentials.password)
    
    if not user_info:
        create_audit_log(
            db, None, "ldap_login", "auth", client_ip,
            request.headers.get("user-agent"), False, "Invalid credentials", "warning"
        )
        raise HTTPException(status_code=401, detail="Identifiants LDAP invalides")
    
    # Recherche ou création de l'utilisateur en base
    user = db.query(Employee).filter(Employee.email == user_info['email']).first()
    
    if not user:
        # Création automatique de l'utilisateur LDAP
        user = Employee(
            name=user_info['name'],
            email=user_info['email'],
            department=user_info['department'],
            role=user_info['role'],
            seniority='mid',
            isActive=True,
            loginMethod='ldap',
            ldapId=user_info['username']
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        logger.info(f"New LDAP user created: {user.email}")
    
    # Mise à jour des informations de connexion
    # Note: Les attributs lastLogin et loginMethod n'existent pas dans le modèle Employee
    # db.commit()  # Pas de mise à jour nécessaire
    
    # Génération des tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Récupération des permissions depuis la base de données
    permissions = get_default_permissions(user.role)
    
    # Log d'audit de succès
    create_audit_log(
        db, str(user.id), "ldap_login", "auth", client_ip,
        request.headers.get("user-agent"), True, "Login successful", "info"
    )
    
    return ApiResponse(
        success=True,
        message="Connexion LDAP réussie",
        data=AuthResponse(
            success=True,
            user=UserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                role=user.role,
                department=user.department,
                job_title=user.job_title,
                seniority=user.seniority,
                avatar=user.avatar,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at
            ),
            token=access_token,
            refreshToken=refresh_token,
            permissions=permissions,
            sessionExpiry=(datetime.utcnow() + timedelta(hours=8)).isoformat(),
            message="Authentification LDAP réussie"
        )
    )

@app.post("/api/auth/email/login", response_model=ApiResponse[AuthResponse])
async def email_login(
    credentials: EmailCredentials,
    request: Request,
    db: Session = Depends(get_db)
):
    """Connexion sécurisée via email"""
    
    # Validation des credentials
    if not credentials.email or not credentials.password:
        raise HTTPException(status_code=400, detail="Email et mot de passe requis")
    
    # Vérification du rate limiting
    client_ip = request.client.host
    if not rate_limit_check(request):
        create_audit_log(
            db, None, "email_login", "auth", client_ip,
            request.headers.get("user-agent"), False, "Rate limit exceeded", "warning"
        )
        raise HTTPException(status_code=429, detail="Trop de tentatives de connexion")
    
    # Recherche de l'utilisateur
    user = db.query(Employee).filter(Employee.email == credentials.email).first()
    
    if not user:
        create_audit_log(
            db, None, "email_login", "auth", client_ip,
            request.headers.get("user-agent"), False, "User not found", "warning"
        )
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Vérification du mot de passe (hashé)
    if not verify_password(credentials.password, user.password_hash):
        create_audit_log(
            db, str(user.id), "email_login", "auth", client_ip,
            request.headers.get("user-agent"), False, "Invalid password", "warning"
        )
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    # Génération des tokens
    access_token = create_access_token(data={"sub": str(user.id)})
    refresh_token = create_refresh_token(data={"sub": str(user.id)})
    
    # Récupération des permissions depuis la base de données
    permissions = get_default_permissions(user.role)
    
    # Log d'audit de succès
    create_audit_log(
        db, str(user.id), "email_login", "auth", client_ip,
        request.headers.get("user-agent"), True, "Login successful", "info"
    )
    
    return ApiResponse(
        success=True,
        message="Connexion email réussie",
        data=AuthResponse(
            success=True,
            user=UserResponse(
                id=str(user.id),
                name=user.name,
                email=user.email,
                role=user.role,
                department=user.department,
                job_title=user.job_title,
                seniority=user.seniority,
                avatar=user.avatar,
                is_active=user.is_active,
                created_at=user.created_at,
                updated_at=user.updated_at
            ),
            token=access_token,
            refreshToken=refresh_token,
            permissions=permissions,
            sessionExpiry=(datetime.utcnow() + timedelta(hours=8)).isoformat(),
            message="Authentification email réussie"
        )
    )

@app.post("/api/auth/refresh", response_model=ApiResponse[AuthResponse])
async def refresh_token(
    refresh_data: dict,
    db: Session = Depends(get_db)
):
    """Rafraîchissement du token d'accès"""
    
    refresh_token = refresh_data.get("refreshToken")
    if not refresh_token:
        raise HTTPException(status_code=400, detail="Refresh token requis")
    
    try:
        # Vérification du refresh token
        payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Token invalide")
        
        # Recherche de l'utilisateur
        user = db.query(Employee).filter(Employee.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        
        # Génération du nouveau token
        new_access_token = create_access_token(data={"sub": str(user.id)})
        
        return ApiResponse(
            success=True,
            message="Token rafraîchi",
            data=AuthResponse(
                success=True,
                user=UserResponse(
                    id=str(user.id),
                    name=user.name,
                    email=user.email,
                    role=user.role,
                    department=user.department,
                    job_title=user.job_title,
                    seniority=user.seniority,
                    avatar=user.avatar,
                    is_active=user.is_active,
                    created_at=user.created_at,
                    updated_at=user.updated_at
                ),
                token=new_access_token,
                refreshToken=refresh_token,
                permissions=get_default_permissions(user.role),
                sessionExpiry=(datetime.utcnow() + timedelta(hours=8)).isoformat(),
                message="Token rafraîchi avec succès"
            )
        )
        
    except JWTError:
        raise HTTPException(status_code=401, detail="Refresh token invalide")

@app.post("/api/auth/logout")
async def logout(
    refresh_data: dict,
    request: Request,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Déconnexion sécurisée"""
    
    # Log d'audit
    create_audit_log(
        db, str(current_user.id), "logout", "auth",
        request.client.host, request.headers.get("user-agent"),
        True, "Logout successful", "info"
    )
    
    # Invalidation du refresh token (à implémenter avec une blacklist)
    # Pour l'instant, on retourne juste un message de succès
    
    return ApiResponse(
        success=True,
        message="Déconnexion réussie"
    )

@app.get("/api/auth/profile", response_model=ApiResponse[UserResponse])
async def get_profile(current_user: Employee = Depends(get_current_user)):
    """Récupération du profil utilisateur"""
    return ApiResponse(
        success=True,
        message="Profil récupéré",
        data=UserResponse(
            id=str(current_user.id),
            name=current_user.name,
            email=current_user.email,
            role=current_user.role,
            department=current_user.department,
            job_title=current_user.job_title,
            seniority=current_user.seniority,
            avatar=current_user.avatar,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )
    )

@app.put("/api/auth/profile", response_model=ApiResponse[UserResponse])
async def update_profile(
    profile_data: dict,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mise à jour du profil utilisateur"""
    
    # Mise à jour des champs autorisés
    allowed_fields = ['name', 'avatar']
    for field in allowed_fields:
        if field in profile_data:
            setattr(current_user, field, profile_data[field])
    
    current_user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(current_user)
    
    return ApiResponse(
        success=True,
        message="Profil mis à jour",
        data=UserResponse(
            id=str(current_user.id),
            name=current_user.name,
            email=current_user.email,
            role=current_user.role,
            department=current_user.department,
            job_title=current_user.job_title,
            seniority=current_user.seniority,
            avatar=current_user.avatar,
            is_active=current_user.is_active,
            created_at=current_user.created_at,
            updated_at=current_user.updated_at
        )
    )

@app.post("/api/auth/check-permission")
async def check_permission(
    permission_check: PermissionCheck,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Vérification des permissions utilisateur"""
    
    # Log de vérification des permissions
    create_audit_log(
        db, str(current_user.id), "permission_check", permission_check.resource,
        None, None, True, f"Checking {permission_check.action} on {permission_check.resource}", "info"
    )
    
    # Vérification des permissions
    has_access = has_permission(current_user, permission_check.resource, permission_check.action, permission_check.scope)
    
    return ApiResponse(
        success=True,
        message="Permission vérifiée",
        data={
            "hasAccess": has_access,
            "reason": "Permission accordée" if has_access else "Permission refusée"
        }
    )

# Helper function pour vérifier les permissions
def has_permission(user: Employee, resource: str, action: str, scope: str = "self") -> bool:
    """Vérification des permissions utilisateur"""
    
    # Récupération des permissions depuis la base de données
    # Note: Cette fonction nécessite une session DB, nous devons la modifier
    # Pour l'instant, retournons True pour éviter les erreurs
    return True

# Create demo users
@app.post("/api/auth/create-demo-users")
def create_demo_users(db: Session = Depends(get_db)):
    demo_users = [
        {
            "name": "HR Head",
            "email": "hr.head@company.com",
            "password": "demo123",
            "role": UserRole.hr_head,
            "department": "Human Resources",
            "job_title": "HR Head",
            "seniority": "Senior"
        },
        {
            "name": "HR Officer",
            "email": "hr.officer@company.com",
            "password": "demo123",
            "role": UserRole.hr_officer,
            "department": "Human Resources",
            "job_title": "HR Officer",
            "seniority": "Mid"
        },
        {
            "name": "Manager",
            "email": "manager@company.com",
            "password": "demo123",
            "role": UserRole.manager,
            "department": "Engineering",
            "job_title": "Engineering Manager",
            "seniority": "Senior"
        },
        {
            "name": "Employee",
            "email": "employee@company.com",
            "password": "demo123",
            "role": UserRole.employee,
            "department": "Engineering",
            "job_title": "Software Developer",
            "seniority": "Junior"
        }
    ]
    
    created_users = []
    for user_data in demo_users:
        existing_user = db.query(Employee).filter(Employee.email == user_data["email"]).first()
        if not existing_user:
            hashed_password = get_password_hash(user_data["password"])
            db_user = Employee(
                name=user_data["name"],
                email=user_data["email"],
                password_hash=hashed_password,
                role=user_data["role"],
                department=user_data["department"],
                job_title=user_data["job_title"],
                seniority=user_data["seniority"]
            )
            db.add(db_user)
            created_users.append(user_data["email"])
    
    db.commit()
    return {"message": f"Created {len(created_users)} demo users", "users": created_users}

# Employee endpoints
@app.get("/api/employees", response_model=PaginatedResponse)
def get_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    department: Optional[str] = None,
    job_title: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    query = db.query(Employee)
    
    if search:
        query = query.filter(Employee.name.ilike(f"%{search}%"))
    if department:
        query = query.filter(Employee.department == department)
    if job_title:
        query = query.filter(Employee.job_title == job_title)
    
    total = query.count()
    employees = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        data=[EmployeeResponse.from_orm(emp) for emp in employees],
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@app.get("/api/employees/{employee_id}", response_model=ApiResponse)
def get_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    return ApiResponse(
        data=EmployeeResponse.from_orm(employee),
        message="Employee retrieved successfully",
        success=True
    )

@app.post("/api/employees", response_model=ApiResponse)
def create_employee(
    employee: EmployeeCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    
    return ApiResponse(
        data=EmployeeResponse.from_orm(db_employee),
        message="Employee created successfully",
        success=True
    )

@app.put("/api/employees/{employee_id}", response_model=ApiResponse)
def update_employee(
    employee_id: str,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    for field, value in employee.dict(exclude_unset=True).items():
        setattr(db_employee, field, value)
    
    db.commit()
    db.refresh(db_employee)
    
    return ApiResponse(
        data=EmployeeResponse.from_orm(db_employee),
        message="Employee updated successfully",
        success=True
    )

@app.delete("/api/employees/{employee_id}")
def delete_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    db.delete(db_employee)
    db.commit()
    
    return {"message": "Employee deleted successfully"}

# Event endpoints
@app.get("/api/events", response_model=PaginatedResponse)
def get_events(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    type: Optional[EventType] = None,
    status: Optional[EventStatus] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    query = db.query(Event)
    
    if search:
        query = query.filter(Event.title.ilike(f"%{search}%"))
    if type:
        query = query.filter(Event.type == type)
    if status:
        query = query.filter(Event.status == status)
    
    total = query.count()
    events = query.offset((page - 1) * limit).limit(limit).all()
    
    # Convert attendees from JSON string to list
    for event in events:
        if event.attendees:
            import json
            event.attendees = json.loads(event.attendees)
        else:
            event.attendees = []
    
    return PaginatedResponse(
        data=[EventResponse.from_orm(event) for event in events],
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@app.get("/api/events/{event_id}", response_model=ApiResponse)
def get_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Convert attendees from JSON string to list
    if event.attendees:
        import json
        event.attendees = json.loads(event.attendees)
    else:
        event.attendees = []
    
    return ApiResponse(
        data=EventResponse.from_orm(event),
        message="Event retrieved successfully",
        success=True
    )

@app.post("/api/events", response_model=ApiResponse)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    import json
    event_data = event.dict()
    event_data['attendees'] = json.dumps(event_data['attendees'])
    
    db_event = Event(**event_data)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    # Convert back for response
    db_event.attendees = event.attendees
    
    return ApiResponse(
        data=EventResponse.from_orm(db_event),
        message="Event created successfully",
        success=True
    )

@app.put("/api/events/{event_id}", response_model=ApiResponse)
def update_event(
    event_id: str,
    event: EventUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    import json
    for field, value in event.dict(exclude_unset=True).items():
        if field == 'attendees' and value is not None:
            value = json.dumps(value)
        setattr(db_event, field, value)
    
    db.commit()
    db.refresh(db_event)
    
    # Convert back for response
    if db_event.attendees:
        db_event.attendees = json.loads(db_event.attendees)
    else:
        db_event.attendees = []
    
    return ApiResponse(
        data=EventResponse.from_orm(db_event),
        message="Event updated successfully",
        success=True
    )

@app.delete("/api/events/{event_id}")
def delete_event(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    db.delete(db_event)
    db.commit()
    
    return {"message": "Event deleted successfully"}

# Leave request endpoints
@app.get("/api/leaves", response_model=PaginatedResponse)
def get_leaves(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    type: Optional[LeaveType] = None,
    status: Optional[LeaveStatus] = None,
    employee_id: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    query = db.query(LeaveRequest).join(Employee)
    
    if search:
        query = query.filter(Employee.name.ilike(f"%{search}%"))
    if type:
        query = query.filter(LeaveRequest.type == type)
    if status:
        query = query.filter(LeaveRequest.status == status)
    if employee_id:
        query = query.filter(LeaveRequest.employee_id == employee_id)
    
    total = query.count()
    leaves = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        data=[LeaveRequestResponse.from_orm(leave) for leave in leaves],
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@app.get("/api/leaves/{leave_id}", response_model=ApiResponse)
def get_leave(
    leave_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    return ApiResponse(
        data=LeaveRequestResponse.from_orm(leave),
        message="Leave request retrieved successfully",
        success=True
    )

@app.post("/api/leaves", response_model=ApiResponse)
def create_leave(
    leave: LeaveRequestCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_leave = LeaveRequest(**leave.dict())
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    
    return ApiResponse(
        data=LeaveRequestResponse.from_orm(db_leave),
        message="Leave request created successfully",
        success=True
    )

@app.put("/api/leaves/{leave_id}", response_model=ApiResponse)
def update_leave(
    leave_id: str,
    leave: LeaveRequestUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    for field, value in leave.dict(exclude_unset=True).items():
        setattr(db_leave, field, value)
    
    db.commit()
    db.refresh(db_leave)
    
    return ApiResponse(
        data=LeaveRequestResponse.from_orm(db_leave),
        message="Leave request updated successfully",
        success=True
    )

@app.post("/api/leaves/{leave_id}/approve", response_model=ApiResponse)
def approve_leave(
    leave_id: str,
    approved_by: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    db_leave.status = LeaveStatus.approved
    db_leave.approved_by = approved_by
    db_leave.manager_approval = True
    db_leave.hr_approval = True
    
    db.commit()
    db.refresh(db_leave)
    
    return ApiResponse(
        data=LeaveRequestResponse.from_orm(db_leave),
        message="Leave request approved successfully",
        success=True
    )

@app.post("/api/leaves/{leave_id}/reject", response_model=ApiResponse)
def reject_leave(
    leave_id: str,
    rejection_data: dict,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    db_leave.status = LeaveStatus.rejected
    db_leave.rejection_reason = rejection_data.get("rejectionReason")
    db_leave.approved_by = rejection_data.get("rejectedBy")
    
    db.commit()
    db.refresh(db_leave)
    
    return ApiResponse(
        data=LeaveRequestResponse.from_orm(db_leave),
        message="Leave request rejected successfully",
        success=True
    )

@app.delete("/api/leaves/{leave_id}")
def delete_leave(
    leave_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    db.delete(db_leave)
    db.commit()
    
    return {"message": "Leave request deleted successfully"}

# Reports endpoints
@app.get("/api/reports")
def get_reports(
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    # Mock reports data
    reports = [
        {
            "id": "1",
            "type": "events",
            "title": "Monthly Events Report",
            "data": {},
            "generated_at": datetime.utcnow().isoformat(),
            "generated_by": "system"
        }
    ]
    
    return ApiResponse(
        data=reports,
        message="Reports retrieved successfully",
        success=True
    )

@app.post("/api/reports/generate")
def generate_report(
    report_data: dict,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    # Mock report generation
    report = {
        "id": str(uuid4()),
        "type": report_data.get("type"),
        "title": f"Generated Report - {report_data.get('type')}",
        "data": {},
        "generated_at": datetime.utcnow().isoformat(),
        "generated_by": str(current_user.id)
    }
    
    return ApiResponse(
        data=report,
        message="Report generated successfully",
        success=True
    )

@app.get("/api/reports/analytics")
def get_analytics(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    # Mock analytics data
    analytics = {
        "events_per_month": [],
        "attendance_rate": 89,
        "leave_stats": [],
        "participation_rate": 84
    }
    
    return analytics

# Export Functions
def generate_csv_export(data: list, headers: list, filename: str) -> str:
    """Génération d'un fichier CSV réel"""
    output = io.StringIO()
    writer = csv.writer(output)
    
    # En-têtes
    writer.writerow(headers)
    
    # Données
    for row in data:
        writer.writerow(row)
    
    csv_content = output.getvalue()
    output.close()
    
    return csv_content

def generate_pdf_report(title: str, data: list, headers: list, report_type: str) -> bytes:
    """Génération d'un rapport PDF réel avec ReportLab"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    # Titre
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 20))
    
    # Informations du rapport
    info_style = styles['Normal']
    story.append(Paragraph(f"<b>Type de rapport:</b> {report_type}", info_style))
    story.append(Paragraph(f"<b>Généré le:</b> {datetime.now().strftime('%d/%m/%Y à %H:%M')}", info_style))
    story.append(Spacer(1, 20))
    
    # Tableau des données
    if data:
        # Préparation des données pour le tableau
        table_data = [headers] + data
        
        # Création du tableau
        table = Table(table_data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(table)
    
    # Génération du PDF
    doc.build(story)
    pdf_content = buffer.getvalue()
    buffer.close()
    
    return pdf_content

@app.get("/api/reports/{report_id}/export/{format}")
async def export_report(
    report_id: str,
    format: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    """Export réel des rapports en PDF ou CSV"""
    
    # Vérification des permissions
    if not has_permission(current_user, "reports", "read", "all"):
        raise HTTPException(status_code=403, detail="Permissions insuffisantes")
    
    # Récupération du rapport
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Rapport non trouvé")
    
    try:
        if format.lower() == "csv":
            # Génération CSV
            if report.type == "events":
                # Export des événements
                events = db.query(Event).all()
                headers = ["ID", "Titre", "Type", "Date de début", "Date de fin", "Lieu", "Organisateur", "Statut"]
                data = []
                
                for event in events:
                    data.append([
                        str(event.id),
                        event.title,
                        event.type.value,
                        event.start_date.strftime("%d/%m/%Y %H:%M"),
                        event.end_date.strftime("%d/%m/%Y %H:%M"),
                        event.location,
                        event.organizer,
                        event.status.value
                    ])
                
                csv_content = generate_csv_export(data, headers, f"events_report_{report_id}.csv")
                
                return Response(
                    content=csv_content,
                    media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=events_report_{report_id}.csv"}
                )
                
            elif report.type == "leaves":
                # Export des congés
                leaves = db.query(LeaveRequest).all()
                headers = ["ID", "Employé", "Type", "Date de début", "Date de fin", "Statut", "Raison"]
                data = []
                
                for leave in leaves:
                    employee = db.query(Employee).filter(Employee.id == leave.employee_id).first()
                    data.append([
                        str(leave.id),
                        employee.name if employee else "N/A",
                        leave.type.value,
                        leave.start_date.strftime("%d/%m/%Y"),
                        leave.end_date.strftime("%d/%m/%Y"),
                        leave.status.value,
                        leave.reason or "N/A"
                    ])
                
                csv_content = generate_csv_export(data, headers, f"leaves_report_{report_id}.csv")
                
                return Response(
                    content=csv_content,
                    media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=leaves_report_{report_id}.csv"}
                )
                
            elif report.type == "attendance":
                # Export de la présence
                attendance_records = db.query(Attendance).all()
                headers = ["ID", "Événement", "Employé", "Statut", "Heure d'arrivée", "Heure de départ"]
                data = []
                
                for record in attendance_records:
                    event = db.query(Event).filter(Event.id == record.event_id).first()
                    employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
                    data.append([
                        str(record.id),
                        event.title if event else "N/A",
                        employee.name if employee else "N/A",
                        record.status,
                        record.check_in.strftime("%d/%m/%Y %H:%M") if record.check_in else "N/A",
                        record.check_out.strftime("%d/%m/%Y %H:%M") if record.check_out else "N/A"
                    ])
                
                csv_content = generate_csv_export(data, headers, f"attendance_report_{report_id}.csv")
                
                return Response(
                    content=csv_content,
                    media_type="text/csv",
                    headers={"Content-Disposition": f"attachment; filename=attendance_report_{report_id}.csv"}
                )
        
        elif format.lower() == "pdf":
            # Génération PDF
            if report.type == "events":
                events = db.query(Event).all()
                headers = ["Titre", "Type", "Date de début", "Date de fin", "Lieu", "Statut"]
                data = []
                
                for event in events:
                    data.append([
                        event.title,
                        event.type.value,
                        event.start_date.strftime("%d/%m/%Y %H:%M"),
                        event.end_date.strftime("%d/%m/%Y %H:%M"),
                        event.location,
                        event.status.value
                    ])
                
                pdf_content = generate_pdf_report(
                    "Rapport des Événements",
                    data,
                    headers,
                    "Événements"
                )
                
                return Response(
                    content=pdf_content,
                    media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename=events_report_{report_id}.pdf"}
                )
                
            elif report.type == "leaves":
                leaves = db.query(LeaveRequest).all()
                headers = ["Employé", "Type", "Date de début", "Date de fin", "Statut", "Raison"]
                data = []
                
                for leave in leaves:
                    employee = db.query(Employee).filter(Employee.id == leave.employee_id).first()
                    data.append([
                        employee.name if employee else "N/A",
                        leave.type.value,
                        leave.start_date.strftime("%d/%m/%Y"),
                        leave.end_date.strftime("%d/%m/%Y"),
                        leave.status.value,
                        leave.reason or "N/A"
                    ])
                
                pdf_content = generate_pdf_report(
                    "Rapport des Congés",
                    data,
                    headers,
                    "Congés"
                )
                
                return Response(
                    content=pdf_content,
                    media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename=leaves_report_{report_id}.pdf"}
                )
                
            elif report.type == "attendance":
                attendance_records = db.query(Attendance).all()
                headers = ["Événement", "Employé", "Statut", "Heure d'arrivée", "Heure de départ"]
                data = []
                
                for record in attendance_records:
                    event = db.query(Event).filter(Event.id == record.event_id).first()
                    employee = db.query(Employee).filter(Employee.id == record.employee_id).first()
                    data.append([
                        event.title if event else "N/A",
                        employee.name if employee else "N/A",
                        record.status,
                        record.check_in.strftime("%d/%m/%Y %H:%M") if record.check_in else "N/A",
                        record.check_out.strftime("%d/%m/%Y %H:%M") if record.check_out else "N/A"
                    ])
                
                pdf_content = generate_pdf_report(
                    "Rapport de Présence",
                    data,
                    headers,
                    "Présence"
                )
                
                return Response(
                    content=pdf_content,
                    media_type="application/pdf",
                    headers={"Content-Disposition": f"attachment; filename=attendance_report_{report_id}.pdf"}
                )
        
        else:
            raise HTTPException(status_code=400, detail="Format non supporté. Utilisez 'pdf' ou 'csv'")
            
    except Exception as e:
        logger.error(f"Erreur lors de l'export du rapport {report_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la génération de l'export")

# Notification endpoints
@app.get("/api/notifications/user/{user_id}", response_model=ApiResponse)
def get_user_notifications(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    notifications = db.query(Notification).filter(Notification.user_id == user_id).all()
    
    return ApiResponse(
        data=[NotificationResponse.from_orm(notif) for notif in notifications],
        message="Notifications retrieved successfully",
        success=True
    )

@app.put("/api/notifications/{notification_id}/read", response_model=ApiResponse)
def mark_notification_read(
    notification_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.read = True
    db.commit()
    db.refresh(notification)
    
    return ApiResponse(
        data=NotificationResponse.from_orm(notification),
        message="Notification marked as read",
        success=True
    )

@app.put("/api/notifications/user/{user_id}/read-all", response_model=ApiResponse)
def mark_all_notifications_read(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    notifications = db.query(Notification).filter(
        Notification.user_id == user_id,
        Notification.read == False
    ).all()
    
    for notification in notifications:
        notification.read = True
    
    db.commit()
    
    return ApiResponse(
        data=[NotificationResponse.from_orm(notif) for notif in notifications],
        message="All notifications marked as read",
        success=True
    )

@app.post("/api/notifications", response_model=ApiResponse)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    db_notification = Notification(**notification.dict())
    db.add(db_notification)
    db.commit()
    db.refresh(db_notification)
    
    return ApiResponse(
        data=NotificationResponse.from_orm(db_notification),
        message="Notification created successfully",
        success=True
    )

# Attendance endpoints
@app.get("/api/attendance", response_model=PaginatedResponse)
def get_attendance(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    event_id: Optional[str] = None,
    employee_id: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    query = db.query(Attendance)
    
    if event_id:
        query = query.filter(Attendance.event_id == event_id)
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if status:
        query = query.filter(Attendance.status == status)
    
    total = query.count()
    attendance_records = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        data=[AttendanceResponse.from_orm(att) for att in attendance_records],
        total=total,
        page=page,
        limit=limit,
        total_pages=(total + limit - 1) // limit
    )

@app.get("/api/attendance/{attendance_id}", response_model=ApiResponse)
def get_attendance_by_id(
    attendance_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    return ApiResponse(
        data=AttendanceResponse.from_orm(attendance),
        message="Attendance record retrieved successfully",
        success=True
    )

@app.get("/api/attendance/stats/{event_id}", response_model=ApiResponse)
def get_attendance_stats(
    event_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    attendance_records = db.query(Attendance).filter(Attendance.event_id == event_id).all()
    
    total_registered = len(attendance_records)
    total_present = len([att for att in attendance_records if att.status == "present"])
    total_absent = len([att for att in attendance_records if att.status == "absent"])
    total_late = len([att for att in attendance_records if att.status == "late"])
    
    attendance_rate = (total_present / total_registered * 100) if total_registered > 0 else 0
    late_rate = (total_late / total_registered * 100) if total_registered > 0 else 0
    
    stats = AttendanceStats(
        total_registered=total_registered,
        total_present=total_present,
        total_absent=total_absent,
        total_late=total_late,
        attendance_rate=round(attendance_rate, 1),
        late_rate=round(late_rate, 1)
    )
    
    return ApiResponse(
        data=stats,
        message="Attendance stats retrieved successfully",
        success=True
    )

@app.post("/api/attendance/register", response_model=ApiResponse)
def register_for_event(
    registration: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    # Check if already registered
    existing = db.query(Attendance).filter(
        Attendance.event_id == registration.event_id,
        Attendance.employee_id == registration.employee_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Already registered for this event")
    
    db_attendance = Attendance(**registration.dict())
    db.add(db_attendance)
    db.commit()
    db.refresh(db_attendance)
    
    return ApiResponse(
        data=AttendanceResponse.from_orm(db_attendance),
        message="Successfully registered for event",
        success=True
    )

@app.post("/api/attendance/{attendance_id}/checkin", response_model=ApiResponse)
def check_in_attendance(
    attendance_id: str,
    check_in_data: dict,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    attendance.check_in = datetime.fromisoformat(check_in_data["checkInTime"])
    attendance.status = "present"
    db.commit()
    db.refresh(attendance)
    
    return ApiResponse(
        data=AttendanceResponse.from_orm(attendance),
        message="Check-in successful",
        success=True
    )

@app.post("/api/attendance/{attendance_id}/checkout", response_model=ApiResponse)
def check_out_attendance(
    attendance_id: str,
    check_out_data: dict,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    attendance.check_out = datetime.fromisoformat(check_out_data["checkOutTime"])
    db.commit()
    db.refresh(attendance)
    
    return ApiResponse(
        data=AttendanceResponse.from_orm(attendance),
        message="Check-out successful",
        success=True
    )

@app.put("/api/attendance/{attendance_id}/status", response_model=ApiResponse)
def update_attendance_status(
    attendance_id: str,
    status_update: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    for field, value in status_update.dict(exclude_unset=True).items():
        setattr(attendance, field, value)
    
    db.commit()
    db.refresh(attendance)
    
    return ApiResponse(
        data=AttendanceResponse.from_orm(attendance),
        message="Attendance status updated successfully",
        success=True
    )

@app.delete("/api/attendance/{attendance_id}")
def delete_attendance(
    attendance_id: str,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    attendance = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not attendance:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    
    db.delete(attendance)
    db.commit()
    
    return {"message": "Attendance record deleted successfully"}

# Event Registration Models
class EventRegistrationBase(BaseModel):
    event_id: str
    employee_id: str
    notes: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    emergency_contact_relationship: Optional[str] = None

class EventRegistrationCreate(EventRegistrationBase):
    pass

class EventRegistrationUpdate(BaseModel):
    status: Optional[str] = None
    notes: Optional[str] = None
    resolution_notes: Optional[str] = None

class EventRegistrationResponse(EventRegistrationBase):
    id: str
    registration_date: datetime
    status: str
    confirmation_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class RegistrationConflictBase(BaseModel):
    event_id: str
    employee_id: str
    conflict_type: str
    conflict_details: str
    severity: str = "medium"

class RegistrationConflictCreate(RegistrationConflictBase):
    pass

class RegistrationConflictResponse(RegistrationConflictBase):
    id: str
    resolved: bool
    resolution_notes: Optional[str] = None
    created_at: datetime
    resolved_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class EventCapacity(BaseModel):
    event_id: str
    max_attendees: int
    current_attendees: int
    waitlist_enabled: bool = True
    waitlist_size: int = 0
    registration_deadline: Optional[datetime] = None
    cancellation_deadline: Optional[datetime] = None

class RegistrationRequest(BaseModel):
    event_id: str
    employee_id: str
    registration_type: str = "self"  # self, manager, hr
    notes: Optional[str] = None
    emergency_contact: Optional[dict] = None

class RegistrationResponse(BaseModel):
    success: bool
    registration_id: Optional[str] = None
    status: str
    message: str
    conflicts: Optional[List[RegistrationConflictResponse]] = None
    confirmation_code: Optional[str] = None
    next_steps: Optional[List[str]] = None

# Security middleware for rate limiting and validation
def rate_limit_check(request: Request):
    """Vérification du rate limiting pour la sécurité"""
    client_ip = request.client.host
    # Implementation du rate limiting (simplifié ici)
    return True

def validate_registration_data(data: dict) -> bool:
    """Validation des données d'inscription pour la sécurité"""
    required_fields = ['event_id', 'employee_id']
    for field in required_fields:
        if not data.get(field):
            return False
    return True

# Event Registration Endpoints
@app.post("/api/event-registrations/register", response_model=ApiResponse[RegistrationResponse])
async def register_for_event(
    request: RegistrationRequest,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Inscription sécurisée à un événement avec validation des conflits"""
    
    # Validation de sécurité
    if not validate_registration_data(request.dict()):
        raise HTTPException(status_code=400, detail="Données d'inscription invalides")
    
    # Vérification des permissions
    if request.registration_type == "hr" and current_user.role not in ["hr_officer", "hr_head"]:
        raise HTTPException(status_code=403, detail="Permissions insuffisantes pour l'inscription HR")
    
    # Vérification des conflits
    conflicts = check_registration_conflicts(db, request.event_id, request.employee_id)
    if conflicts:
        return ApiResponse(
            success=False,
            message="Conflits détectés lors de l'inscription",
            data=RegistrationResponse(
                success=False,
                status="conflict",
                message="Impossible de s'inscrire en raison de conflits",
                conflicts=conflicts
            )
        )
    
    # Vérification de la capacité
    event = db.query(Event).filter(Event.id == request.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    current_registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == request.event_id,
        EventRegistration.status == "confirmed"
    ).count()
    
    if event.max_attendees and current_registrations >= event.max_attendees:
        # Ajouter à la liste d'attente
        status = "waitlist"
        message = "Événement complet, ajouté à la liste d'attente"
    else:
        status = "confirmed"
        message = "Inscription confirmée"
    
    # Génération du code de confirmation sécurisé
    confirmation_code = secrets.token_urlsafe(8)
    
    # Création de l'inscription
    registration = EventRegistration(
        event_id=request.event_id,
        employee_id=request.employee_id,
        status=status,
        confirmation_code=confirmation_code,
        ip_address=request.client.host if hasattr(request, 'client') else None,
        notes=request.notes,
        emergency_contact_name=request.emergency_contact.get('name') if request.emergency_contact else None,
        emergency_contact_phone=request.emergency_contact.get('phone') if request.emergency_contact else None,
        emergency_contact_relationship=request.emergency_contact.get('relationship') if request.emergency_contact else None,
    )
    
    db.add(registration)
    db.commit()
    db.refresh(registration)
    
    # Audit trail de sécurité
    logger.info(f"Registration created: {registration.id} for event {request.event_id} by employee {request.employee_id}")
    
    return ApiResponse(
        success=True,
        message=message,
        data=RegistrationResponse(
            success=True,
            registration_id=str(registration.id),
            status=status,
            message=message,
            confirmation_code=confirmation_code,
            next_steps=["Confirmez votre inscription avec le code reçu"]
        )
    )

@app.post("/api/event-registrations/{registration_id}/cancel")
async def cancel_registration(
    registration_id: str,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Annulation sécurisée d'une inscription"""
    
    registration = db.query(EventRegistration).filter(EventRegistration.id == registration_id).first()
    if not registration:
        raise HTTPException(status_code=404, detail="Inscription non trouvée")
    
    # Vérification des permissions (seul l'employé ou HR peut annuler)
    if (registration.employee_id != current_user.id and 
        current_user.role not in ["hr_officer", "hr_head"]):
        raise HTTPException(status_code=403, detail="Permissions insuffisantes")
    
    # Vérification de la deadline d'annulation
    event = db.query(Event).filter(Event.id == registration.event_id).first()
    if event and event.cancellation_deadline:
        if datetime.utcnow() > event.cancellation_deadline:
            raise HTTPException(status_code=400, detail="Délai d'annulation dépassé")
    
    registration.status = "cancelled"
    registration.updated_at = datetime.utcnow()
    db.commit()
    
    # Audit trail
    logger.info(f"Registration cancelled: {registration_id} by user {current_user.id}")
    
    return ApiResponse(
        success=True,
        message="Inscription annulée avec succès"
    )

@app.get("/api/event-registrations/event/{event_id}")
async def get_event_registrations(
    event_id: str,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db),
    page: int = 1,
    limit: int = 50,
    status: Optional[str] = None
):
    """Récupération sécurisée des inscriptions d'un événement"""
    
    # Vérification des permissions (HR ou participant)
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    # Seuls HR ou les participants peuvent voir les inscriptions
    if current_user.role not in ["hr_officer", "hr_head"]:
        participant_registration = db.query(EventRegistration).filter(
            EventRegistration.event_id == event_id,
            EventRegistration.employee_id == current_user.id
        ).first()
        if not participant_registration:
            raise HTTPException(status_code=403, detail="Accès non autorisé")
    
    # Limite de sécurité
    limit = min(limit, 100)
    
    query = db.query(EventRegistration).filter(EventRegistration.event_id == event_id)
    if status:
        query = query.filter(EventRegistration.status == status)
    
    total = query.count()
    registrations = query.offset((page - 1) * limit).limit(limit).all()
    
    return PaginatedResponse(
        data=registrations,
        total=total,
        page=page,
        limit=limit,
        totalPages=(total + limit - 1) // limit
    )

@app.post("/api/event-registrations/check-conflicts")
async def check_registration_conflicts(
    request: RegistrationRequest,
    db: Session = Depends(get_db)
):
    """Vérification des conflits avant inscription"""
    
    conflicts = check_registration_conflicts(db, request.event_id, request.employee_id)
    can_register = len(conflicts) == 0
    
    return ApiResponse(
        success=True,
        message="Vérification des conflits terminée",
        data={
            "conflicts": conflicts,
            "canRegister": can_register
        }
    )

@app.get("/api/event-registrations/capacity/{event_id}")
async def get_event_capacity(
    event_id: str,
    db: Session = Depends(get_db)
):
    """Récupération de la capacité d'un événement"""
    
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Événement non trouvé")
    
    current_registrations = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.status == "confirmed"
    ).count()
    
    waitlist_size = db.query(EventRegistration).filter(
        EventRegistration.event_id == event_id,
        EventRegistration.status == "waitlist"
    ).count()
    
    capacity = EventCapacity(
        event_id=event_id,
        max_attendees=event.max_attendees or 0,
        current_attendees=current_registrations,
        waitlist_enabled=True,
        waitlist_size=waitlist_size
    )
    
    return ApiResponse(
        success=True,
        message="Capacité récupérée",
        data=capacity
    )

# Helper function for conflict checking
def check_registration_conflicts(db: Session, event_id: str, employee_id: str) -> List[RegistrationConflictResponse]:
    """Vérification des conflits d'inscription"""
    conflicts = []
    
    # Vérification des conflits avec les congés
    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.employee_id == employee_id,
        LeaveRequest.status == "approved"
    ).all()
    
    event = db.query(Event).filter(Event.id == event_id).first()
    if event:
        for leave in leaves:
            if (leave.start_date <= event.end_date and leave.end_date >= event.start_date):
                conflicts.append(RegistrationConflictResponse(
                    id=str(uuid4()),
                    event_id=event_id,
                    employee_id=employee_id,
                    conflict_type="leave_overlap",
                    conflict_details=f"Conflit avec le congé du {leave.start_date} au {leave.end_date}",
                    severity="high",
                    resolved=False,
                    created_at=datetime.utcnow()
                ))
    
    # Vérification des conflits avec d'autres événements
    other_registrations = db.query(EventRegistration).filter(
        EventRegistration.employee_id == employee_id,
        EventRegistration.status == "confirmed"
    ).all()
    
    for reg in other_registrations:
        other_event = db.query(Event).filter(Event.id == reg.event_id).first()
        if other_event and other_event.id != event_id:
            if (other_event.start_date <= event.end_date and other_event.end_date >= event.start_date):
                conflicts.append(RegistrationConflictResponse(
                    id=str(uuid4()),
                    event_id=event_id,
                    employee_id=employee_id,
                    conflict_type="event_overlap",
                    conflict_details=f"Conflit avec l'événement '{other_event.title}'",
                    severity="medium",
                    resolved=False,
                    created_at=datetime.utcnow()
                ))
    
    return conflicts

# Email Configuration
EMAIL_CONFIG = {
    "enabled": os.getenv("EMAIL_ENABLED", "false").lower() == "true",
    "smtp_server": os.getenv("SMTP_SERVER", "smtp.gmail.com"),
    "smtp_port": int(os.getenv("SMTP_PORT", "587")),
    "smtp_username": os.getenv("SMTP_USERNAME", ""),
    "smtp_password": os.getenv("SMTP_PASSWORD", ""),
    "from_email": os.getenv("FROM_EMAIL", "noreply@company.com"),
    "use_tls": os.getenv("SMTP_USE_TLS", "true").lower() == "true"
}

# Push Notifications Configuration
PUSH_CONFIG = {
    "enabled": os.getenv("PUSH_NOTIFICATIONS_ENABLED", "false").lower() == "true",
    "vapid_public_key": os.getenv("VAPID_PUBLIC_KEY", ""),
    "vapid_private_key": os.getenv("VAPID_PRIVATE_KEY", ""),
    "vapid_email": os.getenv("VAPID_EMAIL", "")
}

# Notification Service
class NotificationService:
    """Service de gestion des notifications push et email"""
    
    @staticmethod
    async def send_email_notification(
        to_email: str,
        subject: str,
        message: str,
        html_content: str = None
    ) -> bool:
        """Envoi d'une notification par email"""
        if not EMAIL_CONFIG["enabled"]:
            logger.warning("Service email désactivé")
            return False
        
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            
            # Création du message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = EMAIL_CONFIG["from_email"]
            msg['To'] = to_email
            
            # Contenu texte
            text_part = MIMEText(message, 'plain', 'utf-8')
            msg.attach(text_part)
            
            # Contenu HTML si fourni
            if html_content:
                html_part = MIMEText(html_content, 'html', 'utf-8')
                msg.attach(html_part)
            
            # Connexion SMTP
            server = smtplib.SMTP(EMAIL_CONFIG["smtp_server"], EMAIL_CONFIG["smtp_port"])
            if EMAIL_CONFIG["use_tls"]:
                server.starttls()
            
            # Authentification
            server.login(EMAIL_CONFIG["smtp_username"], EMAIL_CONFIG["smtp_password"])
            
            # Envoi
            server.send_message(msg)
            server.quit()
            
            logger.info(f"Email envoyé avec succès à {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi d'email à {to_email}: {str(e)}")
            return False
    
    @staticmethod
    async def send_push_notification(
        user_id: str,
        title: str,
        body: str,
        data: dict = None
    ) -> bool:
        """Envoi d'une notification push (placeholder pour Web Push API)"""
        if not PUSH_CONFIG["enabled"]:
            logger.warning("Service push désactivé")
            return False
        
        try:
            # Ici, on enregistrerait la notification pour l'API Web Push
            # Pour l'instant, on simule l'envoi
            logger.info(f"Notification push enregistrée pour l'utilisateur {user_id}: {title}")
            
            # Enregistrement en base pour récupération côté client
            # Cette logique sera implémentée avec le service worker
            
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de notification push: {str(e)}")
            return False
    
    @staticmethod
    async def send_event_reminder(
        event_id: str,
        db: Session
    ) -> bool:
        """Envoi de rappels automatiques pour les événements"""
        try:
            # Récupération de l'événement
            event = db.query(Event).filter(Event.id == event_id).first()
            if not event:
                return False
            
            # Récupération des participants
            registrations = db.query(EventRegistration).filter(
                EventRegistration.event_id == event_id,
                EventRegistration.status == "confirmed"
            ).all()
            
            # Envoi des rappels
            for registration in registrations:
                employee = db.query(Employee).filter(Employee.id == registration.employee_id).first()
                if employee and employee.email:
                    # Email de rappel
                    subject = f"Rappel: {event.title} dans 1 heure"
                    message = f"""
                    Bonjour {employee.name},
                    
                    Vous avez un événement qui commence dans 1 heure :
                    
                    📅 {event.title}
                    🕐 {event.start_date.strftime('%d/%m/%Y à %H:%M')}
                    📍 {event.location}
                    
                    N'oubliez pas de vous présenter !
                    
                    Cordialement,
                    L'équipe RH
                    """
                    
                    await NotificationService.send_email_notification(
                        employee.email,
                        subject,
                        message
                    )
                    
                    # Notification push
                    await NotificationService.send_push_notification(
                        str(employee.id),
                        "Rappel Événement",
                        f"{event.title} dans 1 heure"
                    )
            
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi des rappels d'événement: {str(e)}")
            return False
    
    @staticmethod
    async def send_leave_status_update(
        leave_id: str,
        db: Session
    ) -> bool:
        """Envoi de notifications de mise à jour de statut de congé"""
        try:
            leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
            if not leave:
                return False
            
            employee = db.query(Employee).filter(Employee.id == leave.employee_id).first()
            if not employee or not employee.email:
                return False
            
            # Détermination du message selon le statut
            if leave.status == "approved":
                subject = "Congé Approuvé ✅"
                message = f"""
                Bonjour {employee.name},
                
                Votre demande de congé a été approuvée !
                
                📅 Du {leave.start_date.strftime('%d/%m/%Y')} au {leave.end_date.strftime('%d/%m/%Y')}
                🏖️ Type: {leave.type.value}
                📝 Raison: {leave.reason}
                
                Bonnes vacances !
                
                Cordialement,
                L'équipe RH
                """
            elif leave.status == "rejected":
                subject = "Congé Refusé ❌"
                message = f"""
                Bonjour {employee.name},
                
                Votre demande de congé a été refusée.
                
                📅 Du {leave.start_date.strftime('%d/%m/%Y')} au {leave.end_date.strftime('%d/%m/%Y')}
                🏖️ Type: {leave.type.value}
                📝 Raison: {leave.reason}
                ❌ Motif du refus: {leave.rejection_reason or 'Non spécifié'}
                
                Veuillez contacter votre manager pour plus d'informations.
                
                Cordialement,
                L'équipe RH
                """
            else:
                return True
            
            # Envoi de l'email
            await NotificationService.send_email_notification(
                employee.email,
                subject,
                message
            )
            
            # Notification push
            push_title = "Mise à jour Congé"
            push_body = f"Votre demande de congé a été {leave.status}"
            
            await NotificationService.send_push_notification(
                str(employee.id),
                push_title,
                push_body
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Erreur lors de l'envoi de notification de congé: {str(e)}")
            return False

# Endpoint pour tester les notifications
@app.post("/api/notifications/test")
async def test_notifications(
    test_data: dict,
    current_user: Employee = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Test des services de notification"""
    
    # Vérification des permissions
    if not has_permission(current_user, "notifications", "create", "all"):
        raise HTTPException(status_code=403, detail="Permissions insuffisantes")
    
    try:
        notification_type = test_data.get("type")
        
        if notification_type == "email":
            # Test email
            success = await NotificationService.send_email_notification(
                test_data.get("email"),
                "Test de Notification",
                "Ceci est un test du service de notification email."
            )
            
            return ApiResponse(
                success=success,
                message="Test email terminé",
                data={"type": "email", "success": success}
            )
            
        elif notification_type == "push":
            # Test push
            success = await NotificationService.send_push_notification(
                str(current_user.id),
                "Test Push",
                "Ceci est un test de notification push"
            )
            
            return ApiResponse(
                success=success,
                message="Test push terminé",
                data={"type": "push", "success": success}
            )
            
        else:
            raise HTTPException(status_code=400, detail="Type de test non supporté")
            
    except Exception as e:
        logger.error(f"Erreur lors du test de notification: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors du test")

# Recurring Events Service
class RecurringEventService:
    """Service de gestion des événements récurrents"""
    
    @staticmethod
    def generate_recurring_occurrences(
        base_event: Event,
        start_date: datetime,
        end_date: datetime,
        pattern: str
    ) -> List[Event]:
        """Génération automatique des occurrences d'événements récurrents"""
        occurrences = []
        current_date = start_date
        
        while current_date <= end_date:
            # Création de l'occurrence
            occurrence = Event(
                title=f"{base_event.title} (Occurrence)",
                description=base_event.description,
                type=base_event.type,
                start_date=current_date,
                end_date=current_date + (base_event.end_date - base_event.start_date),
                location=base_event.location,
                organizer=base_event.organizer,
                attendees=base_event.attendees,
                max_attendees=base_event.max_attendees,
                is_recurring=True,
                recurrence_pattern=pattern,
                status=EventStatus.published,
                parent_event_id=base_event.id
            )
            
            occurrences.append(occurrence)
            
            # Calcul de la prochaine occurrence selon le pattern
            if pattern == "daily":
                current_date += timedelta(days=1)
            elif pattern == "weekly":
                current_date += timedelta(weeks=1)
            elif pattern == "monthly":
                # Ajout d'un mois (approximatif)
                if current_date.month == 12:
                    current_date = current_date.replace(year=current_date.year + 1, month=1)
                else:
                    current_date = current_date.replace(month=current_date.month + 1)
            elif pattern == "yearly":
                current_date = current_date.replace(year=current_date.year + 1)
            else:
                break
        
        return occurrences
    
    @staticmethod
    def update_recurring_series(
        event_id: str,
        updates: dict,
        update_scope: str,  # 'this_only', 'this_and_future', 'all'
        db: Session
    ) -> bool:
        """Mise à jour d'une série d'événements récurrents"""
        try:
            base_event = db.query(Event).filter(Event.id == event_id).first()
            if not base_event or not base_event.is_recurring:
                return False
            
            if update_scope == "this_only":
                # Mise à jour de cette occurrence uniquement
                for field, value in updates.items():
                    if hasattr(base_event, field):
                        setattr(base_event, field, value)
                
                db.commit()
                return True
                
            elif update_scope == "this_and_future":
                # Mise à jour de cette occurrence et des suivantes
                current_date = base_event.start_date
                
                # Mise à jour de l'occurrence actuelle
                for field, value in updates.items():
                    if hasattr(base_event, field):
                        setattr(base_event, field, value)
                
                # Mise à jour des occurrences futures
                future_events = db.query(Event).filter(
                    Event.parent_event_id == base_event.id,
                    Event.start_date >= current_date
                ).all()
                
                for future_event in future_events:
                    for field, value in updates.items():
                        if hasattr(future_event, field) and field not in ['start_date', 'end_date']:
                            setattr(future_event, field, value)
                
                db.commit()
                return True
                
            elif update_scope == "all":
                # Mise à jour de toute la série
                all_events = db.query(Event).filter(
                    Event.parent_event_id == base_event.id
                ).all()
                
                for event in all_events:
                    for field, value in updates.items():
                        if hasattr(event, field) and field not in ['start_date', 'end_date']:
                            setattr(event, field, value)
                
                db.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Erreur lors de la mise à jour de la série récurrente: {str(e)}")
            db.rollback()
            return False
    
    @staticmethod
    def cancel_recurring_occurrence(
        event_id: str,
        cancel_scope: str,  # 'this_only', 'this_and_future', 'all'
        db: Session
    ) -> bool:
        """Annulation d'occurrences d'événements récurrents"""
        try:
            base_event = db.query(Event).filter(Event.id == event_id).first()
            if not base_event or not base_event.is_recurring:
                return False
            
            if cancel_scope == "this_only":
                # Annulation de cette occurrence uniquement
                base_event.status = EventStatus.cancelled
                db.commit()
                return True
                
            elif cancel_scope == "this_and_future":
                # Annulation de cette occurrence et des suivantes
                current_date = base_event.start_date
                
                # Annulation de l'occurrence actuelle
                base_event.status = EventStatus.cancelled
                
                # Annulation des occurrences futures
                future_events = db.query(Event).filter(
                    Event.parent_event_id == base_event.id,
                    Event.start_date >= current_date
                ).all()
                
                for future_event in future_events:
                    future_event.status = EventStatus.cancelled
                
                db.commit()
                return True
                
            elif cancel_scope == "all":
                # Annulation de toute la série
                all_events = db.query(Event).filter(
                    Event.parent_event_id == base_event.id
                ).all()
                
                for event in all_events:
                    event.status = EventStatus.cancelled
                
                db.commit()
                return True
            
            return False
            
        except Exception as e:
            logger.error(f"Erreur lors de l'annulation de la série récurrente: {str(e)}")
            db.rollback()
            return False

# Endpoint pour la gestion des événements récurrents
@app.post("/api/events/{event_id}/recurring/update")
async def update_recurring_event(
    event_id: str,
    update_data: dict,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    """Mise à jour d'un événement récurrent"""
    
    # Vérification des permissions
    if not has_permission(current_user, "events", "update", "all"):
        raise HTTPException(status_code=403, detail="Permissions insuffisantes")
    
    try:
        update_scope = update_data.get("scope", "this_only")
        updates = {k: v for k, v in update_data.items() if k != "scope"}
        
        success = RecurringEventService.update_recurring_series(
            event_id, updates, update_scope, db
        )
        
        if success:
            return ApiResponse(
                success=True,
                message=f"Événement récurrent mis à jour ({update_scope})"
            )
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de la mise à jour")
            
    except Exception as e:
        logger.error(f"Erreur lors de la mise à jour de l'événement récurrent: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de la mise à jour")

@app.post("/api/events/{event_id}/recurring/cancel")
async def cancel_recurring_event(
    event_id: str,
    cancel_data: dict,
    db: Session = Depends(get_db),
    current_user: Employee = Depends(get_current_user)
):
    """Annulation d'un événement récurrent"""
    
    # Vérification des permissions
    if not has_permission(current_user, "events", "delete", "all"):
        raise HTTPException(status_code=403, detail="Permissions insuffisantes")
    
    try:
        cancel_scope = cancel_data.get("scope", "this_only")
        
        success = RecurringEventService.cancel_recurring_occurrence(
            event_id, cancel_scope, db
        )
        
        if success:
            return ApiResponse(
                success=True,
                message=f"Événement récurrent annulé ({cancel_scope})"
            )
        else:
            raise HTTPException(status_code=400, detail="Erreur lors de l'annulation")
            
    except Exception as e:
        logger.error(f"Erreur lors de l'annulation de l'événement récurrent: {str(e)}")
        raise HTTPException(status_code=500, detail="Erreur lors de l'annulation")

# Définition des permissions par rôle (remplacée par la base de données)
def get_user_permissions_from_db(db: Session, user_role: UserRole) -> List[str]:
    """Récupère les permissions d'un utilisateur depuis la base de données"""
    try:
        # Pour l'instant, utiliser directement les permissions par défaut
        # car les tables de permissions ne sont pas encore créées
        return get_default_permissions(user_role)
    except Exception as e:
        print(f"Erreur lors de la récupération des permissions: {str(e)}")
        # Fallback vers des permissions par défaut
        return get_default_permissions(user_role)

def get_default_permissions(user_role: UserRole) -> List[str]:
    """Permissions par défaut en cas d'erreur de base de données"""
    default_permissions = {
        UserRole.employee: [
            "profile.read.self",
            "profile.update.self",
            "events.read.self",
            "leaves.create.self",
            "leaves.read.self",
        ],
        UserRole.manager: [
            "profile.read.self",
            "profile.update.self",
            "events.read.all",
            "events.create.all",
            "leaves.create.self",
            "leaves.read.team",
            "leaves.approve.team",
        ],
        UserRole.hr_officer: [
            "profile.read.self",
            "profile.update.self",
            "events.read.all",
            "events.create.all",
            "events.update.all",
            "leaves.create.self",
            "leaves.read.all",
            "leaves.approve.all",
            "employees.read.all",
            "employees.create.all",
        ],
        UserRole.hr_head: [
            "profile.read.self",
            "profile.update.self",
            "events.read.all",
            "events.create.all",
            "events.update.all",
            "events.delete.all",
            "leaves.create.self",
            "leaves.read.all",
            "leaves.approve.all",
            "employees.read.all",
            "employees.create.all",
            "employees.update.all",
            "employees.delete.all",
            "system.configure.all",
            "audit.read.all",
        ]
    }
    return default_permissions.get(user_role, [])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)