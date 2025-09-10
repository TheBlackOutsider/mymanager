#!/usr/bin/env python3
"""
Service de gestion des permissions dynamiques pour HRlead
Récupère les permissions depuis la base de données au lieu du code
"""

from typing import List, Dict, Optional, Set
from sqlalchemy.orm import Session
from main import Role, Permission, PermissionCondition, Employee, UserRole

class PermissionService:
    """Service de gestion des permissions dynamiques"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_permissions(self, user_id: str) -> List[Dict]:
        """Récupère toutes les permissions d'un utilisateur (rôle + personnalisées)"""
        user = self.db.query(Employee).filter(Employee.id == user_id).first()
        if not user:
            return []
        
        permissions = []
        
        # 1. Permissions du rôle
        role_permissions = self.get_role_permissions(user.role)
        permissions.extend(role_permissions)
        
        # 2. Permissions personnalisées de l'utilisateur
        custom_permissions = self.get_custom_user_permissions(user_id)
        permissions.extend(custom_permissions)
        
        return permissions
    
    def get_role_permissions(self, role: UserRole) -> List[Dict]:
        """Récupère les permissions d'un rôle depuis la base de données"""
        role_obj = self.db.query(Role).filter(Role.id == role.value).first()
        if not role_obj:
            return []
        
        permissions = []
        for permission in role_obj.permissions:
            if permission.is_active:
                permissions.append({
                    "id": str(permission.id),
                    "name": permission.name,
                    "resource": permission.resource,
                    "action": permission.action,
                    "scope": permission.scope,
                    "description": permission.description
                })
        
        return permissions
    
    def get_custom_user_permissions(self, user_id: str) -> List[Dict]:
        """Récupère les permissions personnalisées d'un utilisateur"""
        user = self.db.query(Employee).filter(Employee.id == user_id).first()
        if not user or not user.custom_permissions:
            return []
        
        permissions = []
        for permission in user.custom_permissions:
            if permission.is_active:
                permissions.append({
                    "id": str(permission.id),
                    "name": permission.name,
                    "resource": permission.resource,
                    "action": permission.action,
                    "scope": permission.scope,
                    "description": permission.description,
                    "is_custom": True
                })
        
        return permissions
    
    def check_permission(self, user_id: str, resource: str, action: str, target_id: str = None) -> bool:
        """Vérifie si un utilisateur a une permission spécifique"""
        user = self.db.query(Employee).filter(Employee.id == user_id).first()
        if not user:
            return False
        
        # Récupérer toutes les permissions de l'utilisateur
        permissions = self.get_user_permissions(user_id)
        
        # Vérifier la permission exacte
        for permission in permissions:
            if (permission["resource"] == resource and 
                permission["action"] == action):
                
                # Vérifier le scope
                if self._check_scope(permission["scope"], user, target_id):
                    return True
        
        return False
    
    def _check_scope(self, scope: str, user: Employee, target_id: str = None) -> bool:
        """Vérifie si le scope de la permission est respecté"""
        if scope == "self":
            return target_id == str(user.id) if target_id else True
        elif scope == "team":
            # Vérifier si l'utilisateur cible est dans la même équipe
            if target_id:
                target_user = self.db.query(Employee).filter(Employee.id == target_id).first()
                return target_user and target_user.department == user.department
            return True
        elif scope == "department":
            # Vérifier si l'utilisateur cible est dans le même département
            if target_id:
                target_user = self.db.query(Employee).filter(Employee.id == target_id).first()
                return target_user and target_user.department == user.department
            return True
        elif scope == "all":
            return True
        else:
            return False
    
    def add_custom_permission(self, user_id: str, permission_data: Dict) -> bool:
        """Ajoute une permission personnalisée à un utilisateur"""
        try:
            user = self.db.query(Employee).filter(Employee.id == user_id).first()
            if not user:
                return False
            
            # Créer la permission
            permission = Permission(
                name=permission_data["name"],
                resource=permission_data["resource"],
                action=permission_data["action"],
                scope=permission_data["scope"],
                description=permission_data.get("description", "")
            )
            
            self.db.add(permission)
            user.custom_permissions.append(permission)
            self.db.commit()
            
            return True
        except Exception as e:
            self.db.rollback()
            print(f"Erreur lors de l'ajout de la permission: {str(e)}")
            return False
    
    def remove_custom_permission(self, user_id: str, permission_id: str) -> bool:
        """Supprime une permission personnalisée d'un utilisateur"""
        try:
            user = self.db.query(Employee).filter(Employee.id == user_id).first()
            if not user:
                return False
            
            # Trouver et supprimer la permission
            permission = self.db.query(Permission).filter(Permission.id == permission_id).first()
            if permission and permission in user.custom_permissions:
                user.custom_permissions.remove(permission)
                self.db.commit()
                return True
            
            return False
        except Exception as e:
            self.db.rollback()
            print(f"Erreur lors de la suppression de la permission: {str(e)}")
            return False
    
    def get_permission_matrix(self) -> Dict:
        """Génère une matrice des permissions pour tous les rôles"""
        roles = self.db.query(Role).filter(Role.is_active == True).all()
        permissions = self.db.query(Permission).filter(Permission.is_active == True).all()
        
        matrix = {}
        for role in roles:
            matrix[role.id] = {}
            for permission in permissions:
                has_permission = permission in role.permissions
                matrix[role.id][f"{permission.resource}.{permission.action}"] = has_permission
        
        return matrix
    
    def update_role_permissions(self, role_id: str, permission_ids: List[str]) -> bool:
        """Met à jour les permissions d'un rôle"""
        try:
            role = self.db.query(Role).filter(Role.id == role_id).first()
            if not role:
                return False
            
            # Récupérer les nouvelles permissions
            new_permissions = self.db.query(Permission).filter(
                Permission.id.in_(permission_ids)
            ).all()
            
            # Mettre à jour les permissions du rôle
            role.permissions = new_permissions
            self.db.commit()
            
            return True
        except Exception as e:
            self.db.rollback()
            print(f"Erreur lors de la mise à jour des permissions: {str(e)}")
            return False

# Fonction utilitaire pour remplacer ROLE_PERMISSIONS.get()
def get_user_permissions_from_db(db: Session, user_id: str) -> List[Dict]:
    """Fonction utilitaire pour récupérer les permissions d'un utilisateur"""
    service = PermissionService(db)
    return service.get_user_permissions(user_id) 