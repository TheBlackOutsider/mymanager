#!/usr/bin/env python3
"""
Script de correction de l'attribution des permissions aux rôles
"""

from main import SessionLocal, Base, engine
from sqlalchemy import Column, String, Boolean, ForeignKey, Table, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from uuid import uuid4

# Table de liaison many-to-many pour les permissions des rôles
role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', String, ForeignKey('roles.id')),
    Column('permission_id', UUID(as_uuid=True), ForeignKey('permissions.id'))
)

# Modèle pour les rôles
class Role(Base):
    __tablename__ = "roles"
    
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

# Modèle pour les permissions
class Permission(Base):
    __tablename__ = "permissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    resource = Column(String, nullable=False)
    action = Column(String, nullable=False)
    scope = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

def fix_permissions():
    """Corrige l'attribution des permissions aux rôles"""
    print("🔧 Correction de l'attribution des permissions aux rôles...")
    
    db = SessionLocal()
    
    try:
        # 1. Vérification des données existantes
        print("\n📊 Vérification des données existantes...")
        roles = db.query(Role).all()
        permissions = db.query(Permission).all()
        
        print(f"   - Rôles trouvés: {len(roles)}")
        print(f"   - Permissions trouvées: {len(permissions)}")
        
        # 2. Attribution des permissions aux rôles
        print("\n🔗 Attribution des permissions aux rôles...")
        
        # Récupération des rôles
        employee_role = db.query(Role).filter(Role.id == "employee").first()
        manager_role = db.query(Role).filter(Role.id == "manager").first()
        hr_officer_role = db.query(Role).filter(Role.id == "hr_officer").first()
        hr_head_role = db.query(Role).filter(Role.id == "hr_head").first()
        
        # Permissions pour Employee
        if employee_role:
            employee_permissions = db.query(Permission).filter(
                Permission.scope == "self",
                Permission.resource.in_(["profile", "events", "leaves"])
            ).all()
            
            # Nettoyer les permissions existantes
            employee_role.permissions.clear()
            # Ajouter les nouvelles permissions
            employee_role.permissions.extend(employee_permissions)
            
            print(f"   ✅ {len(employee_permissions)} permissions attribuées au rôle Employee")
            for perm in employee_permissions:
                print(f"      • {perm.resource}.{perm.action} ({perm.scope})")
        
        # Permissions pour Manager
        if manager_role:
            manager_permissions = db.query(Permission).filter(
                Permission.scope.in_(["self", "team"]),
                Permission.resource.in_(["profile", "events", "leaves", "reports"])
            ).all()
            
            manager_role.permissions.clear()
            manager_role.permissions.extend(manager_permissions)
            
            print(f"   ✅ {len(manager_permissions)} permissions attribuées au rôle Manager")
            for perm in manager_permissions:
                print(f"      • {perm.resource}.{perm.action} ({perm.scope})")
        
        # Permissions pour HR Officer
        if hr_officer_role:
            hr_officer_permissions = db.query(Permission).filter(
                Permission.scope.in_(["self", "all"]),
                Permission.resource.in_(["profile", "events", "leaves", "employees", "reports"])
            ).all()
            
            hr_officer_role.permissions.clear()
            hr_officer_role.permissions.extend(hr_officer_permissions)
            
            print(f"   ✅ {len(hr_officer_permissions)} permissions attribuées au rôle HR Officer")
            for perm in hr_officer_permissions:
                print(f"      • {perm.resource}.{perm.action} ({perm.scope})")
        
        # Permissions pour HR Head
        if hr_head_role:
            hr_head_permissions = db.query(Permission).filter(
                Permission.scope.in_(["self", "all"]),
                Permission.resource.in_(["profile", "events", "leaves", "employees", "reports", "system", "audit"])
            ).all()
            
            hr_head_role.permissions.clear()
            hr_head_role.permissions.extend(hr_head_permissions)
            
            print(f"   ✅ {len(hr_head_permissions)} permissions attribuées au rôle HR Head")
            for perm in hr_head_permissions:
                print(f"      • {perm.resource}.{perm.action} ({perm.scope})")
        
        # Commit des changements
        db.commit()
        print("\n🎉 Permissions corrigées avec succès!")
        
        # 3. Vérification finale
        print("\n🔍 Vérification finale...")
        for role in roles:
            print(f"   - {role.name}: {len(role.permissions)} permissions")
        
        # Vérification des relations dans la base
        from sqlalchemy import text
        role_perms_count = db.execute(text("SELECT COUNT(*) FROM role_permissions")).scalar()
        print(f"   - Total des relations role_permissions: {role_perms_count}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la correction: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_permissions() 