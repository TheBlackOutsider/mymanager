#!/usr/bin/env python3
"""
Script simplifié de création de la structure de base de données pour les permissions
Crée seulement les tables essentielles sans relations complexes
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
    
    id = Column(String, primary_key=True)  # employee, manager, hr_officer, hr_head
    name = Column(String, nullable=False)   # Nom lisible du rôle
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
    name = Column(String, nullable=False)           # Nom lisible de la permission
    resource = Column(String, nullable=False)       # events, leaves, employees, etc.
    action = Column(String, nullable=False)         # create, read, update, delete, approve
    scope = Column(String, nullable=False)          # self, team, department, all
    description = Column(Text, nullable=True)       # Description détaillée
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relations
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

def create_permissions_structure():
    """Crée la structure de base de données pour les permissions"""
    print("🚀 Création de la structure de base de données des permissions...")
    
    # Création des tables
    Base.metadata.create_all(bind=engine)
    print("✅ Tables créées avec succès!")
    
    # Initialisation des données de base
    db = SessionLocal()
    
    try:
        print("\n📝 Initialisation des données de base...")
        
        # 1. Création des rôles
        print("👥 Création des rôles...")
        roles_data = [
            {"id": "employee", "name": "Employé", "description": "Utilisateur standard"},
            {"id": "manager", "name": "Manager", "description": "Chef d'équipe"},
            {"id": "hr_officer", "name": "Chargé RH", "description": "Responsable RH"},
            {"id": "hr_head", "name": "Directeur RH", "description": "Directeur des ressources humaines"},
        ]
        
        for role_data in roles_data:
            existing = db.query(Role).filter(Role.id == role_data["id"]).first()
            if not existing:
                role = Role(**role_data)
                db.add(role)
                print(f"   ✅ Rôle créé: {role_data['name']}")
            else:
                print(f"   ⚠️ Rôle existe déjà: {role_data['name']}")
        
        # 2. Création des permissions de base
        print("\n🔐 Création des permissions de base...")
        permissions_data = [
            # Permissions de profil
            {"name": "Voir son profil", "resource": "profile", "action": "read", "scope": "self", "description": "Accès en lecture à son propre profil"},
            {"name": "Modifier son profil", "resource": "profile", "action": "update", "scope": "self", "description": "Modification de son propre profil"},
            
            # Permissions des événements
            {"name": "Voir les événements", "resource": "events", "action": "read", "scope": "self", "description": "Accès en lecture aux événements"},
            {"name": "Créer des événements", "resource": "events", "action": "create", "scope": "all", "description": "Création d'événements"},
            {"name": "Modifier des événements", "resource": "events", "action": "update", "scope": "team", "description": "Modification des événements de l'équipe"},
            {"name": "Supprimer des événements", "resource": "events", "action": "delete", "scope": "all", "description": "Suppression d'événements"},
            
            # Permissions des congés
            {"name": "Demander des congés", "resource": "leaves", "action": "create", "scope": "self", "description": "Création de demandes de congés"},
            {"name": "Voir ses congés", "resource": "leaves", "action": "read", "scope": "self", "description": "Accès à ses propres congés"},
            {"name": "Voir les congés de l'équipe", "resource": "leaves", "action": "read", "scope": "team", "description": "Accès aux congés de l'équipe"},
            {"name": "Approuver des congés", "resource": "leaves", "action": "approve", "scope": "team", "description": "Approbation des congés de l'équipe"},
            {"name": "Rejeter des congés", "resource": "leaves", "action": "reject", "scope": "team", "description": "Rejet des congés de l'équipe"},
            {"name": "Gérer tous les congés", "resource": "leaves", "action": "manage", "scope": "all", "description": "Gestion complète des congés"},
            
            # Permissions des employés
            {"name": "Voir les employés", "resource": "employees", "action": "read", "scope": "team", "description": "Accès aux informations des employés de l'équipe"},
            {"name": "Gérer tous les employés", "resource": "employees", "action": "manage", "scope": "all", "description": "Gestion complète des employés"},
            
            # Permissions des rapports
            {"name": "Voir les rapports", "resource": "reports", "action": "read", "scope": "team", "description": "Accès aux rapports de l'équipe"},
            {"name": "Générer des rapports", "resource": "reports", "action": "generate", "scope": "team", "description": "Génération de rapports"},
            {"name": "Exporter des rapports", "resource": "reports", "action": "export", "scope": "all", "description": "Export des rapports"},
            
            # Permissions système
            {"name": "Configuration système", "resource": "system", "action": "configure", "scope": "all", "description": "Configuration des paramètres système"},
            {"name": "Audit et logs", "resource": "audit", "action": "read", "scope": "all", "description": "Accès aux logs d'audit"},
            {"name": "Configuration de l'audit", "resource": "audit", "action": "configure", "scope": "all", "description": "Configuration de l'audit"},
        ]
        
        for perm_data in permissions_data:
            existing = db.query(Permission).filter(
                Permission.resource == perm_data["resource"],
                Permission.action == perm_data["action"],
                Permission.scope == perm_data["scope"]
            ).first()
            
            if not existing:
                permission = Permission(**perm_data)
                db.add(permission)
                print(f"   ✅ Permission créée: {perm_data['name']}")
            else:
                print(f"   ⚠️ Permission existe déjà: {perm_data['name']}")
        
        # 3. Attribution des permissions aux rôles
        print("\n🔗 Attribution des permissions aux rôles...")
        
        # Récupération des rôles et permissions
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
            employee_role.permissions = employee_permissions
            print(f"   ✅ {len(employee_permissions)} permissions attribuées au rôle Employee")
        
        # Permissions pour Manager
        if manager_role:
            manager_permissions = db.query(Permission).filter(
                Permission.scope.in_(["self", "team"]),
                Permission.resource.in_(["profile", "events", "leaves", "reports"])
            ).all()
            manager_role.permissions = manager_permissions
            print(f"   ✅ {len(manager_permissions)} permissions attribuées au rôle Manager")
        
        # Permissions pour HR Officer
        if hr_officer_role:
            hr_officer_permissions = db.query(Permission).filter(
                Permission.scope.in_(["self", "all"]),
                Permission.resource.in_(["profile", "events", "leaves", "employees", "reports"])
            ).all()
            hr_officer_role.permissions = hr_officer_permissions
            print(f"   ✅ {len(hr_officer_permissions)} permissions attribuées au rôle HR Officer")
        
        # Permissions pour HR Head
        if hr_head_role:
            hr_head_permissions = db.query(Permission).filter(
                Permission.scope.in_(["self", "all"]),
                Permission.resource.in_(["profile", "events", "leaves", "employees", "reports", "system", "audit"])
            ).all()
            hr_head_role.permissions = hr_head_permissions
            print(f"   ✅ {len(hr_head_permissions)} permissions attribuées au rôle HR Head")
        
        # Commit des changements
        db.commit()
        print("\n🎉 Structure des permissions créée avec succès!")
        
        # Résumé
        print("\n📊 Résumé:")
        print(f"   - Rôles: {db.query(Role).count()}")
        print(f"   - Permissions: {db.query(Permission).count()}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la création: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_permissions_structure() 