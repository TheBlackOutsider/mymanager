import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from shared.models.leave import LeaveRequest, LeaveType, LeaveStatus

logger = logging.getLogger(__name__)

class LeaveService:
    """Service de gestion des congés avec pattern Singleton"""
    
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(LeaveService, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._initialized = True
    
    def get_all_leaves(self, db: Session, page: int = 1, limit: int = 10,
                      search: Optional[str] = None, type: Optional[LeaveType] = None,
                      status: Optional[LeaveStatus] = None, employee_id: Optional[str] = None) -> Dict[str, Any]:
        """Récupération de tous les congés avec pagination et filtres"""
        query = db.query(LeaveRequest)
        
        # Filtres
        if search:
            query = query.join(Employee).filter(Employee.name.ilike(f"%{search}%"))
        
        if type:
            query = query.filter(LeaveRequest.type == type)
        
        if status:
            query = query.filter(LeaveRequest.status == status)
        
        if employee_id:
            query = query.filter(LeaveRequest.employee_id == employee_id)
        
        # Pagination
        total = query.count()
        leaves = query.offset((page - 1) * limit).limit(limit).all()
        
        return {
            "data": leaves,
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit
        }
    
    def get_leave_by_id(self, db: Session, leave_id: str) -> Optional[LeaveRequest]:
        """Récupération d'un congé par ID"""
        return db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
    
    def create_leave_request(self, db: Session, leave_data: dict) -> LeaveRequest:
        """Création d'une nouvelle demande de congé"""
        leave = LeaveRequest(**leave_data)
        db.add(leave)
        db.commit()
        db.refresh(leave)
        return leave
    
    def update_leave_request(self, db: Session, leave_id: str, update_data: dict) -> Optional[LeaveRequest]:
        """Mise à jour d'une demande de congé"""
        leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
        if not leave:
            return None
        
        for field, value in update_data.items():
            if hasattr(leave, field) and value is not None:
                setattr(leave, field, value)
        
        db.commit()
        db.refresh(leave)
        return leave
    
    def delete_leave_request(self, db: Session, leave_id: str) -> bool:
        """Suppression d'une demande de congé"""
        leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
        if not leave:
            return False
        
        db.delete(leave)
        db.commit()
        return True
    
    def approve_leave(self, db: Session, leave_id: str, approved_by: str) -> bool:
        """Approbation d'une demande de congé"""
        leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
        if not leave:
            return False
        
        leave.status = LeaveStatus.approved
        leave.approved_by = approved_by
        leave.manager_approval = True
        leave.hr_approval = True
        
        db.commit()
        return True
    
    def reject_leave(self, db: Session, leave_id: str, rejection_reason: str, rejected_by: str) -> bool:
        """Rejet d'une demande de congé"""
        leave = db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()
        if not leave:
            return False
        
        leave.status = LeaveStatus.rejected
        leave.rejection_reason = rejection_reason
        leave.approved_by = rejected_by
        
        db.commit()
        return True
    
    def get_leaves_by_employee(self, db: Session, employee_id: str) -> List[LeaveRequest]:
        """Récupération des congés d'un employé"""
        return db.query(LeaveRequest).filter(LeaveRequest.employee_id == employee_id).all()
    
    def get_pending_leaves(self, db: Session) -> List[LeaveRequest]:
        """Récupération des congés en attente"""
        return db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.pending).all()
    
    def get_approved_leaves(self, db: Session) -> List[LeaveRequest]:
        """Récupération des congés approuvés"""
        return db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.approved).all()
    
    def get_rejected_leaves(self, db: Session) -> List[LeaveRequest]:
        """Récupération des congés rejetés"""
        return db.query(LeaveRequest).filter(LeaveRequest.status == LeaveStatus.rejected).all()
    
    def get_leaves_by_period(self, db: Session, start_date: datetime, end_date: datetime) -> List[LeaveRequest]:
        """Récupération des congés sur une période"""
        return db.query(LeaveRequest).filter(
            and_(
                LeaveRequest.start_date <= end_date,
                LeaveRequest.end_date >= start_date
            )
        ).all()
    
    def check_leave_conflicts(self, db: Session, employee_id: str, start_date: datetime, end_date: datetime) -> List[LeaveRequest]:
        """Vérification des conflits de congés"""
        return db.query(LeaveRequest).filter(
            and_(
                LeaveRequest.employee_id == employee_id,
                LeaveRequest.status == LeaveStatus.approved,
                LeaveRequest.start_date <= end_date,
                LeaveRequest.end_date >= start_date
            )
        ).all()
    
    def get_leave_statistics(self, db: Session, employee_id: Optional[str] = None) -> Dict[str, Any]:
        """Statistiques des congés"""
        query = db.query(LeaveRequest)
        
        if employee_id:
            query = query.filter(LeaveRequest.employee_id == employee_id)
        
        total_leaves = query.count()
        pending_leaves = query.filter(LeaveRequest.status == LeaveStatus.pending).count()
        approved_leaves = query.filter(LeaveRequest.status == LeaveStatus.approved).count()
        rejected_leaves = query.filter(LeaveRequest.status == LeaveStatus.rejected).count()
        
        return {
            "total": total_leaves,
            "pending": pending_leaves,
            "approved": approved_leaves,
            "rejected": rejected_leaves,
            "approval_rate": (approved_leaves / total_leaves * 100) if total_leaves > 0 else 0
        }
