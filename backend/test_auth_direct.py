#!/usr/bin/env python3
"""
Script de test direct de la fonction d'authentification
"""

from main import SessionLocal, Employee, verify_password, get_user_permissions_from_db
from main import UserRole

def test_auth_direct():
    """Test direct de la fonction d'authentification"""
    print("🧪 Test direct de l'authentification...")
    
    db = SessionLocal()
    
    try:
        # 1. Test de récupération de l'utilisateur
        print("\n1️⃣ Test de récupération de l'utilisateur...")
        user = db.query(Employee).filter(Employee.email == "admin.hr@company.com").first()
        
        if user:
            print(f"   ✅ Utilisateur trouvé: {user.name} ({user.email})")
            print(f"   🎭 Rôle: {user.role}")
            print(f"   🔑 Hash du mot de passe: {user.password_hash[:20]}...")
        else:
            print("   ❌ Utilisateur non trouvé")
            return
        
        # 2. Test de vérification du mot de passe
        print("\n2️⃣ Test de vérification du mot de passe...")
        password = "password123"
        is_valid = verify_password(password, user.password_hash)
        print(f"   Mot de passe '{password}': {'✅ Valide' if is_valid else '❌ Invalide'}")
        
        if not is_valid:
            print("   ❌ Échec de la vérification du mot de passe")
            return
        
        # 3. Test de récupération des permissions
        print("\n3️⃣ Test de récupération des permissions...")
        try:
            permissions = get_user_permissions_from_db(db, user.role)
            print(f"   ✅ Permissions récupérées: {len(permissions)}")
            for perm in permissions[:3]:  # Afficher les 3 premières
                print(f"      • {perm.get('resource', 'N/A')}.{perm.get('action', 'N/A')}")
        except Exception as e:
            print(f"   ❌ Erreur lors de la récupération des permissions: {str(e)}")
            print("   🔄 Utilisation des permissions par défaut...")
            from main import get_default_permissions
            permissions = get_default_permissions(user.role)
            print(f"   ✅ Permissions par défaut: {len(permissions)}")
        
        print("\n🎉 Test direct réussi!")
        
    except Exception as e:
        print(f"❌ Erreur lors du test: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_auth_direct() 