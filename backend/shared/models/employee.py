from sqlalchemy import Column, String, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4
import enum
from .base import Base, TimestampMixin
from .base import BaseModel
from typing import Optional
from datetime import datetime

class UserRole(str, enum.Enum):
    employee = "employee"
    manager = "manager"
    hr_officer = "hr_officer"
    hr_head = "hr_head"

class Employee(Base, TimestampMixin):
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

# Pydantic Models
class EmployeeBase(BaseModel):
    name: str
    email: str
    department: str
    job_title: str
    seniority: str
    avatar: Optional[str] = None
    is_active: bool = True

class EmployeeCreate(EmployeeBase):
    password: str

class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None
    seniority: Optional[str] = None
    avatar: Optional[str] = None
    is_active: Optional[bool] = None

class EmployeeResponse(EmployeeBase):
    id: str
    role: UserRole
    created_at: datetime
    updated_at: datetime
