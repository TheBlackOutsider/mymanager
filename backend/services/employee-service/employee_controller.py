from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel
from typing import Optional, List
from .employee_service import EmployeeService
from shared.models.employee import EmployeeCreate, EmployeeUpdate

employee_router = APIRouter()

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None

class PaginatedResponse(BaseModel):
    data: List[dict]
    total: int
    page: int
    limit: int
    total_pages: int

@employee_router.get("/", response_model=PaginatedResponse)
async def get_employees(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    department: Optional[str] = None
):
    """Récupération de tous les employés avec pagination"""
    employee_service = EmployeeService()
    # Note: Il faudra injecter la session DB ici
    result = employee_service.get_all_employees(None, page, limit, search, department)
    
    return PaginatedResponse(
        data=[emp.__dict__ for emp in result["data"]],
        total=result["total"],
        page=result["page"],
        limit=result["limit"],
        total_pages=result["total_pages"]
    )

@employee_router.get("/{employee_id}", response_model=ApiResponse)
async def get_employee(employee_id: str):
    """Récupération d'un employé par ID"""
    employee_service = EmployeeService()
    employee = employee_service.get_employee_by_id(None, employee_id)
    
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    return ApiResponse(
        success=True,
        message="Employé récupéré",
        data=employee.__dict__
    )

@employee_router.post("/", response_model=ApiResponse)
async def create_employee(employee_data: EmployeeCreate):
    """Création d'un nouvel employé"""
    employee_service = EmployeeService()
    
    try:
        employee = employee_service.create_employee(None, employee_data.dict())
        return ApiResponse(
            success=True,
            message="Employé créé avec succès",
            data=employee.__dict__
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur lors de la création: {str(e)}")

@employee_router.put("/{employee_id}", response_model=ApiResponse)
async def update_employee(employee_id: str, update_data: EmployeeUpdate):
    """Mise à jour d'un employé"""
    employee_service = EmployeeService()
    
    employee = employee_service.update_employee(None, employee_id, update_data.dict(exclude_unset=True))
    if not employee:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    return ApiResponse(
        success=True,
        message="Employé mis à jour",
        data=employee.__dict__
    )

@employee_router.delete("/{employee_id}")
async def delete_employee(employee_id: str):
    """Suppression d'un employé"""
    employee_service = EmployeeService()
    
    success = employee_service.delete_employee(None, employee_id)
    if not success:
        raise HTTPException(status_code=404, detail="Employé non trouvé")
    
    return {"message": "Employé supprimé avec succès"}
