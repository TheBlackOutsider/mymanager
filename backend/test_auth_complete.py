#!/usr/bin/env python3
"""
Script de test complet de l'authentification et des rapports
"""

import requests
import json

def test_auth_complete():
    """Test complet de l'authentification et des rapports"""
    print("🧪 Test complet de l'authentification et des rapports...")
    
    base_url = "http://localhost:8000/api"
    
    # 1. Test de connexion
    print("\n1️⃣ Test de connexion...")
    login_data = {
        "email": "admin.hr@company.com",
        "password": "password123"
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/email/login", json=login_data)
        print(f"   📊 Status: {login_response.status_code}")
        
        if login_response.status_code == 200:
            login_result = login_response.json()
            print("   ✅ Connexion réussie!")
            
            # Extraire le token
            if 'data' in login_result and 'token' in login_result['data']:
                token = login_result['data']['token']
                print(f"   🔑 Token reçu: {token[:20]}...")
                
                # 2. Test d'accès aux rapports avec le token
                print("\n2️⃣ Test d'accès aux rapports avec le token...")
                
                headers = {
                    'Authorization': f'Bearer {token}',
                    'Content-Type': 'application/json'
                }
                
                reports_response = requests.get(f"{base_url}/reports/analytics", headers=headers)
                print(f"   📊 Status rapports: {reports_response.status_code}")
                
                if reports_response.status_code == 200:
                    print("   ✅ Accès aux rapports réussi!")
                    reports_data = reports_response.json()
                    print(f"   📄 Données: {json.dumps(reports_data, indent=2)}")
                else:
                    print(f"   ❌ Erreur accès rapports: {reports_response.text}")
                
                # 3. Test d'accès au profil utilisateur
                print("\n3️⃣ Test d'accès au profil utilisateur...")
                
                profile_response = requests.get(f"{base_url}/auth/profile", headers=headers)
                print(f"   📊 Status profil: {profile_response.status_code}")
                
                if profile_response.status_code == 200:
                    print("   ✅ Accès au profil réussi!")
                    profile_data = profile_response.json()
                    print(f"   👤 Utilisateur: {profile_data['data']['name']} ({profile_data['data']['email']})")
                else:
                    print(f"   ❌ Erreur accès profil: {profile_response.text}")
                
            else:
                print("   ❌ Token non trouvé dans la réponse")
                print(f"   📄 Réponse complète: {json.dumps(login_result, indent=2)}")
        else:
            print(f"   ❌ Échec de la connexion: {login_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur lors du test: {str(e)}")

if __name__ == "__main__":
    test_auth_complete() 