#!/usr/bin/env python3
"""
Script d'initialisation des données de base pour HRlead
Initialise les rôles, permissions et données essentielles
"""

import sys
import os
from datetime import datetime, timedelta
from uuid import uuid4

# Ajouter le répertoire parent au path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import direct depuis le répertoire courant
from main import SessionLocal, Employee, Event, LeaveRequest, Notification, SecurityAuditLog
from main import UserRole, EventType, EventStatus, LeaveType, LeaveStatus, NotificationType

def init_base_data():
    """Initialise les données de base de l'application"""
    db = SessionLocal()
    
    try:
        print("🚀 Initialisation des données de base...")
        
        # 1. Créer les employés de base avec différents rôles
        print("👥 Création des employés de base...")
        
        base_employees = [
            {
                "id": str(uuid4()),
                "name": "Admin HR",
                "email": "admin.hr@company.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8J8K8",  # password123
                "role": UserRole.hr_head,
                "department": "Ressources Humaines",
                "job_title": "Directeur RH",
                "seniority": "Senior",
                "avatar": None,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Manager IT",
                "email": "manager.it@company.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8J8K8",  # password123
                "role": UserRole.manager,
                "department": "Informatique",
                "job_title": "Chef de Projet",
                "seniority": "Senior",
                "avatar": None,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "Employee Dev",
                "email": "dev@company.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8J8K8",  # password123
                "role": UserRole.employee,
                "department": "Informatique",
                "job_title": "Développeur",
                "seniority": "Junior",
                "avatar": None,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "name": "HR Officer",
                "email": "hr.officer@company.com",
                "password_hash": "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K8J8K8",  # password123
                "role": UserRole.hr_officer,
                "department": "Ressources Humaines",
                "job_title": "Chargé RH",
                "seniority": "Mid-level",
                "avatar": None,
                "is_active": True,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Vérifier si les employés existent déjà
        for emp_data in base_employees:
            existing = db.query(Employee).filter(Employee.email == emp_data["email"]).first()
            if not existing:
                employee = Employee(**emp_data)
                db.add(employee)
                print(f"✅ Employé créé: {emp_data['name']} ({emp_data['role']})")
            else:
                print(f"⚠️ Employé existe déjà: {emp_data['name']}")
        
        # 2. Créer des événements de base
        print("📅 Création des événements de base...")
        
        base_events = [
            {
                "id": str(uuid4()),
                "title": "Formation Sécurité IT",
                "description": "Formation obligatoire sur la cybersécurité pour tous les employés",
                "type": EventType.training,
                "start_date": datetime.utcnow() + timedelta(days=7),
                "end_date": datetime.utcnow() + timedelta(days=7, hours=3),
                "location": "Salle de Formation A",
                "organizer": "IT Department",
                "attendees": [],
                "max_attendees": 50,
                "is_recurring": False,
                "recurrence_pattern": None,
                "status": EventStatus.published,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            },
            {
                "id": str(uuid4()),
                "title": "Onboarding Nouveaux Employés",
                "description": "Session d'intégration pour les nouveaux collaborateurs",
                "type": EventType.onboarding,
                "start_date": datetime.utcnow() + timedelta(days=14),
                "end_date": datetime.utcnow() + timedelta(days=14, hours=4),
                "location": "Salle de Conférence",
                "organizer": "RH Department",
                "attendees": [],
                "max_attendees": 20,
                "is_recurring": True,
                "recurrence_pattern": "monthly",
                "status": EventStatus.published,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        ]
        
        # Vérifier si les événements existent déjà
        for event_data in base_events:
            existing = db.query(Event).filter(Event.title == event_data["title"]).first()
            if not existing:
                event = Event(**event_data)
                db.add(event)
                print(f"✅ Événement créé: {event_data['title']}")
            else:
                print(f"⚠️ Événement existe déjà: {event_data['title']}")
        
        # 3. Créer des demandes de congés de base
        print("🌴 Création des demandes de congés de base...")
        
        # Récupérer un employé pour créer des demandes de congés
        employee = db.query(Employee).filter(Employee.role == UserRole.employee).first()
        
        if employee:
            base_leaves = [
                {
                    "id": str(uuid4()),
                    "employee_id": employee.id,
                    "type": LeaveType.annual,
                    "start_date": datetime.utcnow() + timedelta(days=30),
                    "end_date": datetime.utcnow() + timedelta(days=34),
                    "reason": "Vacances d'été",
                    "status": LeaveStatus.pending,
                    "manager_approval": None,
                    "hr_approval": None,
                    "approved_by": None,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            ]
            
            for leave_data in base_leaves:
                existing = db.query(LeaveRequest).filter(
                    LeaveRequest.employee_id == leave_data["employee_id"],
                    LeaveRequest.start_date == leave_data["start_date"]
                ).first()
                
                if not existing:
                    leave = LeaveRequest(**leave_data)
                    db.add(leave)
                    print(f"✅ Demande de congé créée: {leave_data['type']} pour {employee.name}")
                else:
                    print(f"⚠️ Demande de congé existe déjà")
        
        # 4. Créer des notifications de base
        print("🔔 Création des notifications de base...")
        
        base_notifications = [
            {
                "id": str(uuid4()),
                "user_id": employee.id if employee else None,
                "type": NotificationType.event_reminder,
                "title": "Rappel: Formation Sécurité IT",
                "message": "N'oubliez pas votre formation de sécurité demain à 9h00",
                "is_read": False,
                "created_at": datetime.utcnow()
            }
        ]
        
        for notif_data in base_notifications:
            if notif_data["user_id"]:
                existing = db.query(Notification).filter(
                    Notification.user_id == notif_data["user_id"],
                    Notification.title == notif_data["title"]
                ).first()
                
                if not existing:
                    notification = Notification(**notif_data)
                    db.add(notification)
                    print(f"✅ Notification créée: {notif_data['title']}")
                else:
                    print(f"⚠️ Notification existe déjà")
        
        # 5. Créer des logs d'audit de base
        print("📝 Création des logs d'audit de base...")
        
        base_audit_logs = [
            {
                "id": str(uuid4()),
                "user_id": None,
                "action": "system_initialization",
                "resource": "database",
                "ip_address": "127.0.0.1",
                "user_agent": "init_script/1.0",
                "success": True,
                "details": "Initialisation des données de base du système",
                "severity": "info",
                "created_at": datetime.utcnow()
            }
        ]
        
        for log_data in base_audit_logs:
            audit_log = SecurityAuditLog(**log_data)
            db.add(audit_log)
            print(f"✅ Log d'audit créé: {log_data['action']}")
        
        # Commit des changements
        db.commit()
        print("🎉 Initialisation terminée avec succès!")
        
        # Afficher un résumé
        print("\n📊 Résumé de l'initialisation:")
        print(f"   - Employés: {db.query(Employee).count()}")
        print(f"   - Événements: {db.query(Event).count()}")
        print(f"   - Demandes de congés: {db.query(LeaveRequest).count()}")
        print(f"   - Notifications: {db.query(Notification).count()}")
        print(f"   - Logs d'audit: {db.query(SecurityAuditLog).count()}")
        
    except Exception as e:
        print(f"❌ Erreur lors de l'initialisation: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Démarrage de l'initialisation des données de base...")
    init_base_data()
    print("✅ Script terminé!") 