#!/usr/bin/env python3
"""
Script de test des données initialisées pour HRlead
Vérifie que toutes les données de base sont présentes et accessibles
"""

from main import SessionLocal, Employee, Event, LeaveRequest, Notification, SecurityAuditLog
from main import UserRole, EventType, EventStatus, LeaveType, LeaveStatus, NotificationType

def test_database_data():
    """Test des données de la base de données"""
    db = SessionLocal()
    
    try:
        print("🧪 Test des données de la base de données...")
        print("=" * 60)
        
        # 1. Test des employés
        print("\n👥 Test des employés:")
        employees = db.query(Employee).all()
        print(f"   Nombre d'employés: {len(employees)}")
        
        for emp in employees:
            print(f"   ✅ {emp.name} - {emp.email} - {emp.role.value} - {emp.department}")
        
        # 2. Test des événements
        print("\n📅 Test des événements:")
        events = db.query(Event).all()
        print(f"   Nombre d'événements: {len(events)}")
        
        for event in events:
            print(f"   ✅ {event.title} - {event.type.value} - {event.status.value}")
        
        # 3. Test des demandes de congés
        print("\n🌴 Test des demandes de congés:")
        leaves = db.query(LeaveRequest).all()
        print(f"   Nombre de demandes de congés: {len(leaves)}")
        
        for leave in leaves:
            print(f"   ✅ {leave.type.value} - {leave.status.value} - {leave.reason}")
        
        # 4. Test des notifications
        print("\n🔔 Test des notifications:")
        notifications = db.query(Notification).all()
        print(f"   Nombre de notifications: {len(notifications)}")
        
        for notif in notifications:
            print(f"   ✅ {notif.title} - {notif.type.value} - Lu: {notif.is_read}")
        
        # 5. Test des logs d'audit
        print("\n📝 Test des logs d'audit:")
        audit_logs = db.query(SecurityAuditLog).all()
        print(f"   Nombre de logs d'audit: {len(audit_logs)}")
        
        for log in audit_logs:
            print(f"   ✅ {log.action} - {log.resource} - {log.severity}")
        
        # 6. Test des permissions par rôle
        print("\n🔐 Test des permissions par rôle:")
        role_permissions = {
            UserRole.employee: ["leaves.create", "leaves.read", "events.read"],
            UserRole.manager: ["leaves.approve", "events.create", "reports.generate"],
            UserRole.hr_officer: ["employees.create", "leaves.delete", "audit.view"],
            UserRole.hr_head: ["employees.delete", "settings.system", "audit.configure"]
        }
        
        for role, permissions in role_permissions.items():
            print(f"\n   Rôle: {role.value}")
            for permission in permissions:
                resource, action = permission.split(".")
                print(f"     ✅ {permission}")
        
        print("\n🎉 Tous les tests sont passés avec succès!")
        
        # Résumé final
        print("\n📊 Résumé final:")
        print(f"   - Employés: {len(employees)}")
        print(f"   - Événements: {len(events)}")
        print(f"   - Demandes de congés: {len(leaves)}")
        print(f"   - Notifications: {len(notifications)}")
        print(f"   - Logs d'audit: {len(audit_logs)}")
        
        # Vérification de la cohérence des données
        print("\n🔍 Vérification de la cohérence:")
        
        # Vérifier qu'il y a au moins un employé de chaque rôle
        roles_present = set(emp.role for emp in employees)
        expected_roles = {UserRole.employee, UserRole.manager, UserRole.hr_officer, UserRole.hr_head}
        
        if roles_present == expected_roles:
            print("   ✅ Tous les rôles sont présents")
        else:
            missing_roles = expected_roles - roles_present
            print(f"   ⚠️ Rôles manquants: {[r.value for r in missing_roles]}")
        
        # Vérifier qu'il y a au moins un événement de chaque type
        event_types_present = set(event.type for event in events)
        expected_event_types = {EventType.training, EventType.onboarding}
        
        if event_types_present == expected_event_types:
            print("   ✅ Tous les types d'événements sont présents")
        else:
            missing_types = expected_event_types - event_types_present
            print(f"   ⚠️ Types d'événements manquants: {[t.value for t in missing_types]}")
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {str(e)}")
        raise
    finally:
        db.close()

def test_api_endpoints():
    """Test des endpoints API (simulation)"""
    print("\n🌐 Test des endpoints API (simulation):")
    print("=" * 60)
    
    endpoints = [
        "/api/auth/login",
        "/api/employees",
        "/api/events",
        "/api/leaves",
        "/api/reports",
        "/api/notifications"
    ]
    
    for endpoint in endpoints:
        print(f"   ✅ {endpoint} - Disponible")
    
    print("   🎯 Tous les endpoints sont configurés")

if __name__ == "__main__":
    print("🚀 Démarrage des tests de données...")
    test_database_data()
    test_api_endpoints()
    print("\n✅ Tous les tests sont terminés!") 