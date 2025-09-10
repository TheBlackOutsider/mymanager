#!/usr/bin/env python3
"""
Script de test de l'authentification pour HRlead
Teste la connexion avec les comptes créés
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
    },
    {
        "name": "Manager IT",
        "email": "manager.it@company.com",
        "password": "password123"
    },
    {
        "name": "Employee Dev",
        "email": "dev@company.com",
        "password": "password123"
    },
    {
        "name": "HR Officer",
        "email": "hr.officer@company.com",
        "password": "password123"
    }
]

def test_authentication():
    """Test de l'authentification pour tous les comptes"""
    print("🧪 Test de l'authentification...")
    print("=" * 50)
    
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
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    print("   ✅ Connexion réussie!")
                    print(f"   🎭 Rôle: {data['data']['user']['role']}")
                    print(f"   🔑 Token reçu: {'Oui' if data['data']['token'] else 'Non'}")
                    
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
    print("=" * 50)
    
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
    print("🚀 Démarrage des tests d'authentification...")
    
    # Test des endpoints
    test_endpoints()
    
    # Test de l'authentification
    test_authentication()
    
    print("\n✅ Tous les tests sont terminés!") 