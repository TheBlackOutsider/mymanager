#!/usr/bin/env python3
"""
Script de correction des mots de passe des utilisateurs
Recrée les hashs corrects pour tous les utilisateurs
"""

from main import SessionLocal, Employee, pwd_context
from passlib.context import CryptContext

def fix_user_passwords():
    """Corrige les mots de passe de tous les utilisateurs"""
    print("🔐 Correction des mots de passe des utilisateurs...")
    
    # Créer un nouveau contexte de hashage
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    
    db = SessionLocal()
    
    try:
        # Récupérer tous les utilisateurs
        users = db.query(Employee).all()
        print(f"📊 {len(users)} utilisateurs trouvés")
        
        # Nouveau mot de passe pour tous
        new_password = "password123"
        new_hash = pwd_context.hash(new_password)
        
        print(f"🔑 Nouveau hash généré: {new_hash[:20]}...")
        
        # Mettre à jour tous les utilisateurs
        for user in users:
            old_hash = user.password_hash
            user.password_hash = new_hash
            
            print(f"   ✅ {user.name} ({user.email}): Mot de passe mis à jour")
            print(f"      Ancien hash: {old_hash[:20]}...")
            print(f"      Nouveau hash: {user.password_hash[:20]}...")
        
        # Commit des changements
        db.commit()
        print("\n🎉 Tous les mots de passe ont été corrigés!")
        
        # Test de vérification
        print("\n🧪 Test de vérification...")
        test_user = db.query(Employee).filter(Employee.email == "admin.hr@company.com").first()
        if test_user:
            is_valid = pwd_context.verify(new_password, test_user.password_hash)
            print(f"   Test avec {new_password}: {'✅ Valide' if is_valid else '❌ Invalide'}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la correction: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_passwords() 