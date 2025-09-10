#!/usr/bin/env python3
"""
Script pour corriger les mots de passe des comptes de démonstration
"""

from main import SessionLocal, Employee, get_password_hash

def fix_demo_passwords():
    """Corrige les mots de passe des comptes de démonstration"""
    print("🔧 Correction des mots de passe des comptes de démonstration...")
    
    db = SessionLocal()
    
    try:
        # Comptes de démonstration avec leurs nouveaux mots de passe
        demo_accounts = [
            {
                "email": "hr.head@company.com",
                "password": "demo123",
                "description": "HR Head"
            },
            {
                "email": "hr.officer@company.com", 
                "password": "demo123",
                "description": "HR Officer"
            },
            {
                "email": "manager@company.com",
                "password": "demo123",
                "description": "Manager"
            },
            {
                "email": "employee@company.com",
                "password": "demo123",
                "description": "Employee"
            }
        ]
        
        for account in demo_accounts:
            print(f"\n🔑 Mise à jour de {account['description']}...")
            
            # Rechercher l'utilisateur
            user = db.query(Employee).filter(Employee.email == account["email"]).first()
            
            if user:
                # Générer le nouveau hash du mot de passe
                new_password_hash = get_password_hash(account["password"])
                
                # Mettre à jour le mot de passe
                user.password_hash = new_password_hash
                
                print(f"   ✅ {account['email']} - Mot de passe mis à jour")
            else:
                print(f"   ❌ {account['email']} - Utilisateur non trouvé")
        
        # Commit des changements
        db.commit()
        print("\n🎉 Mots de passe mis à jour avec succès!")
        
        # Test de connexion avec le premier compte
        print("\n🧪 Test de connexion avec hr.head@company.com...")
        test_user = db.query(Employee).filter(Employee.email == "hr.head@company.com").first()
        if test_user:
            from main import verify_password
            is_valid = verify_password("demo123", test_user.password_hash)
            print(f"   Mot de passe 'demo123': {'✅ Valide' if is_valid else '❌ Invalide'}")
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_demo_passwords() 