#!/usr/bin/env python3
"""
Script de test de l'authentification avec les nouvelles permissions dynamiques
"""

import requests
import json

# Configuration
API_BASE_URL = "http://localhost:8000/api"
TEST_ACCOUNTS = [
    {
        "name": "Admin HR",
        "email": "admin.hr@company.com",
        "password": "password123"
    }
]

def test_authentication():
    """Test de l'authentification avec les nouvelles permissions"""
    print("🧪 Test de l'authentification avec permissions dynamiques...")
    print("=" * 60)
    
    for account in TEST_ACCOUNTS:
        print(f"\n🔐 Test de connexion pour: {account['name']}")
        print(f"   Email: {account['email']}")
        
        try:
            # Test de connexion
            login_data = {
                "email": account['email'],
                "password": account['password']
            }
            
            response = requests.post(
                f"{API_BASE_URL}/auth/email/login",
                json=login_data,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"   📡 Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print("   ✅ Connexion réussie!")
                    print(f"   🎭 Rôle: {data['data']['user']['role']}")
                    print(f"   🔑 Token reçu: {'Oui' if data['data']['token'] else 'Non'}")
                    
                    # Vérification des permissions
                    permissions = data['data'].get('permissions', [])
                    print(f"   🔐 Permissions reçues: {len(permissions)}")
                    
                    for perm in permissions[:5]:  # Afficher les 5 premières
                        print(f"      • {perm.get('resource', 'N/A')}.{perm.get('action', 'N/A')} ({perm.get('scope', 'N/A')})")
                    
                    if len(permissions) > 5:
                        print(f"      ... et {len(permissions) - 5} autres permissions")
                    
                    # Test de récupération du profil utilisateur
                    token = data['data']['token']
                    headers = {"Authorization": f"Bearer {token}"}
                    
                    profile_response = requests.get(
                        f"{API_BASE_URL}/auth/me",
                        headers=headers
                    )
                    
                    if profile_response.status_code == 200:
                        print("   ✅ Profil utilisateur récupéré avec succès")
                    else:
                        print(f"   ❌ Erreur récupération profil: {profile_response.status_code}")
                        
                else:
                    print(f"   ❌ Échec de connexion: {data.get('message', 'Erreur inconnue')}")
            else:
                print(f"   ❌ Erreur HTTP: {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   📝 Détails: {error_data.get('detail', 'Aucun détail')}")
                except:
                    print(f"   📝 Réponse: {response.text}")
                    
        except requests.exceptions.ConnectionError:
            print("   ❌ Impossible de se connecter au serveur")
        except Exception as e:
            print(f"   ❌ Erreur: {str(e)}")
    
    print("\n🎯 Test terminé!")

def test_endpoints():
    """Test de la disponibilité des endpoints"""
    print("\n🌐 Test de la disponibilité des endpoints...")
    print("=" * 60)
    
    endpoints = [
        "/api/auth/email/login",
        "/api/auth/ldap/login",
        "/api/auth/me",
        "/api/employees",
        "/api/events",
        "/api/leaves"
    ]
    
    for endpoint in endpoints:
        try:
            response = requests.get(f"http://localhost:8000{endpoint}")
            print(f"   {endpoint}: {response.status_code}")
        except:
            print(f"   {endpoint}: ❌ Inaccessible")

if __name__ == "__main__":
    print("🚀 Démarrage des tests d'authentification avec permissions dynamiques...")
    
    # Test des endpoints
    test_endpoints()
    
    # Test de l'authentification
    test_authentication()
    
    print("\n✅ Tous les tests sont terminés!") 