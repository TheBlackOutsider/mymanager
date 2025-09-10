#!/usr/bin/env python3
"""
Script pour vérifier les utilisateurs existants dans la base de données
"""

from main import SessionLocal, Employee

def check_existing_users():
    """Vérifie les utilisateurs existants"""
    print("🔍 Vérification des utilisateurs existants...")
    
    db = SessionLocal()
    
    try:
        # Récupérer tous les utilisateurs
        users = db.query(Employee).all()
        
        print(f"\n📊 Total des utilisateurs: {len(users)}")
        
        for user in users:
            print(f"\n👤 Utilisateur:")
            print(f"   ID: {user.id}")
            print(f"   Nom: {user.name}")
            print(f"   Email: {user.email}")
            print(f"   Rôle: {user.role}")
            print(f"   Département: {user.department}")
            print(f"   Hash du mot de passe: {user.password_hash[:20]}...")
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    check_existing_users() 