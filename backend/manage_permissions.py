#!/usr/bin/env python3
"""
Script de gestion des permissions et rôles pour HRlead
Définit les permissions par rôle et permet leur modification
"""

import sys
import os
from typing import Dict, List, Set

# Ajouter le répertoire parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import UserRole

class PermissionManager:
    """Gestionnaire des permissions du système"""
    
    def __init__(self):
        # Définition des permissions par ressource
        self.permissions = {
            "employees": {
                "create": "Créer des employés",
                "read": "Lire les informations des employés",
                "update": "Modifier les informations des employés",
                "delete": "Supprimer des employés",
                "export": "Exporter les données des employés"
            },
            "events": {
                "create": "Créer des événements",
                "read": "Lire les événements",
                "update": "Modifier les événements",
                "delete": "Supprimer des événements",
                "publish": "Publier des événements",
                "cancel": "Annuler des événements",
                "manage_attendees": "Gérer les participants",
                "export": "Exporter les événements"
            },
            "leaves": {
                "create": "Créer des demandes de congés",
                "read": "Lire les demandes de congés",
                "update": "Modifier les demandes de congés",
                "delete": "Supprimer des demandes de congés",
                "approve": "Approuver les demandes de congés",
                "reject": "Rejeter les demandes de congés",
                "export": "Exporter les congés"
            },
            "reports": {
                "view": "Voir les rapports",
                "generate": "Générer des rapports",
                "export": "Exporter les rapports",
                "schedule": "Planifier des rapports automatiques"
            },
            "notifications": {
                "send": "Envoyer des notifications",
                "read": "Lire les notifications",
                "manage": "Gérer les notifications",
                "configure": "Configurer les notifications"
            },
            "settings": {
                "view": "Voir les paramètres",
                "modify": "Modifier les paramètres",
                "system": "Paramètres système"
            },
            "audit": {
                "view": "Voir les logs d'audit",
                "export": "Exporter les logs",
                "configure": "Configurer l'audit"
            }
        }
        
        # Définition des permissions par rôle
        self.role_permissions = {
            UserRole.employee: {
                "employees": ["read"],  # Peut voir ses propres infos
                "events": ["read"],
                "leaves": ["create", "read", "update"],
                "reports": ["view"],
                "notifications": ["read"],
                "settings": ["view"],
                "audit": []
            },
            UserRole.manager: {
                "employees": ["read", "update"],  # Peut voir et modifier ses équipiers
                "events": ["create", "read", "update", "publish", "manage_attendees"],
                "leaves": ["create", "read", "update", "approve", "reject"],
                "reports": ["view", "generate", "export"],
                "notifications": ["send", "read", "manage"],
                "settings": ["view", "modify"],
                "audit": ["view"]
            },
            UserRole.hr_officer: {
                "employees": ["create", "read", "update", "export"],
                "events": ["create", "read", "update", "delete", "publish", "cancel", "manage_attendees", "export"],
                "leaves": ["create", "read", "update", "delete", "approve", "reject", "export"],
                "reports": ["view", "generate", "export", "schedule"],
                "notifications": ["send", "read", "manage", "configure"],
                "settings": ["view", "modify"],
                "audit": ["view", "export"]
            },
            UserRole.hr_head: {
                "employees": ["create", "read", "update", "delete", "export"],
                "events": ["create", "read", "update", "delete", "publish", "cancel", "manage_attendees", "export"],
                "leaves": ["create", "read", "update", "delete", "approve", "reject", "export"],
                "reports": ["view", "generate", "export", "schedule"],
                "notifications": ["send", "read", "manage", "configure"],
                "settings": ["view", "modify", "system"],
                "audit": ["view", "export", "configure"]
            }
        }
    
    def get_permissions_for_role(self, role: UserRole) -> Dict[str, List[str]]:
        """Récupère les permissions pour un rôle donné"""
        return self.role_permissions.get(role, {})
    
    def get_all_permissions(self) -> Dict[str, Dict[str, str]]:
        """Récupère toutes les permissions disponibles"""
        return self.permissions
    
    def check_permission(self, role: UserRole, resource: str, action: str) -> bool:
        """Vérifie si un rôle a une permission spécifique"""
        role_perms = self.role_permissions.get(role, {})
        resource_perms = role_perms.get(resource, [])
        return action in resource_perms
    
    def get_roles_with_permission(self, resource: str, action: str) -> List[UserRole]:
        """Récupère tous les rôles qui ont une permission spécifique"""
        roles = []
        for role, permissions in self.role_permissions.items():
            if resource in permissions and action in permissions[resource]:
                roles.append(role)
        return roles
    
    def add_permission_to_role(self, role: UserRole, resource: str, action: str) -> bool:
        """Ajoute une permission à un rôle"""
        if role not in self.role_permissions:
            self.role_permissions[role] = {}
        
        if resource not in self.role_permissions[role]:
            self.role_permissions[role][resource] = []
        
        if action not in self.role_permissions[role][resource]:
            self.role_permissions[role][resource].append(action)
            return True
        return False
    
    def remove_permission_from_role(self, role: UserRole, resource: str, action: str) -> bool:
        """Supprime une permission d'un rôle"""
        if role in self.role_permissions and resource in self.role_permissions[role]:
            if action in self.role_permissions[role][resource]:
                self.role_permissions[role][resource].remove(action)
                return True
        return False
    
    def print_role_permissions(self, role: UserRole = None):
        """Affiche les permissions par rôle"""
        if role:
            print(f"\n🔐 Permissions pour le rôle: {role.value}")
            print("=" * 50)
            permissions = self.get_permissions_for_role(role)
            for resource, actions in permissions.items():
                print(f"\n📁 {resource.upper()}:")
                for action in actions:
                    description = self.permissions.get(resource, {}).get(action, action)
                    print(f"   ✅ {action}: {description}")
        else:
            print("\n🔐 Permissions par rôle:")
            print("=" * 50)
            for role in UserRole:
                self.print_role_permissions(role)
    
    def print_permission_matrix(self):
        """Affiche la matrice des permissions"""
        print("\n📊 Matrice des Permissions:")
        print("=" * 80)
        
        # En-tête
        header = f"{'Ressource/Action':<20}"
        for role in UserRole:
            header += f"{role.value:<15}"
        print(header)
        print("-" * 80)
        
        # Corps de la matrice
        for resource, actions in self.permissions.items():
            for action, description in actions.items():
                row = f"{resource}.{action:<20}"
                for role in UserRole:
                    has_perm = self.check_permission(role, resource, action)
                    row += f"{'✅' if has_perm else '❌':<15}"
                print(row)

def main():
    """Fonction principale"""
    manager = PermissionManager()
    
    print("🚀 Gestionnaire de Permissions HRlead")
    print("=" * 50)
    
    while True:
        print("\n📋 Menu:")
        print("1. Voir toutes les permissions")
        print("2. Voir les permissions par rôle")
        print("3. Voir la matrice des permissions")
        print("4. Vérifier une permission spécifique")
        print("5. Ajouter une permission à un rôle")
        print("6. Supprimer une permission d'un rôle")
        print("7. Quitter")
        
        choice = input("\n🎯 Votre choix (1-7): ").strip()
        
        if choice == "1":
            print("\n📚 Toutes les permissions disponibles:")
            for resource, actions in manager.get_all_permissions().items():
                print(f"\n📁 {resource.upper()}:")
                for action, description in actions.items():
                    print(f"   • {action}: {description}")
        
        elif choice == "2":
            role_choice = input("\n🎭 Choisissez un rôle (employee/manager/hr_officer/hr_head) ou 'all': ").strip()
            if role_choice == "all":
                manager.print_role_permissions()
            else:
                try:
                    role = UserRole(role_choice)
                    manager.print_role_permissions(role)
                except ValueError:
                    print("❌ Rôle invalide!")
        
        elif choice == "3":
            manager.print_permission_matrix()
        
        elif choice == "4":
            role_input = input("🎭 Rôle: ").strip()
            resource = input("📁 Ressource: ").strip()
            action = input("⚡ Action: ").strip()
            
            try:
                role = UserRole(role_input)
                has_perm = manager.check_permission(role, resource, action)
                print(f"\n🔍 Résultat: {role.value} {'A' if has_perm else 'N\'A PAS'} la permission {action} sur {resource}")
            except ValueError:
                print("❌ Rôle invalide!")
        
        elif choice == "5":
            role_input = input("🎭 Rôle: ").strip()
            resource = input("📁 Ressource: ").strip()
            action = input("⚡ Action: ").strip()
            
            try:
                role = UserRole(role_input)
                success = manager.add_permission_to_role(role, resource, action)
                if success:
                    print(f"✅ Permission {action} ajoutée au rôle {role.value}")
                else:
                    print(f"⚠️ Permission déjà existante")
            except ValueError:
                print("❌ Rôle invalide!")
        
        elif choice == "6":
            role_input = input("🎭 Rôle: ").strip()
            resource = input("📁 Ressource: ").strip()
            action = input("⚡ Action: ").strip()
            
            try:
                role = UserRole(role_input)
                success = manager.remove_permission_from_role(role, resource, action)
                if success:
                    print(f"✅ Permission {action} supprimée du rôle {role.value}")
                else:
                    print(f"⚠️ Permission non trouvée")
            except ValueError:
                print("❌ Rôle invalide!")
        
        elif choice == "7":
            print("👋 Au revoir!")
            break
        
        else:
            print("❌ Choix invalide!")

if __name__ == "__main__":
    main() 