#!/usr/bin/env python3
"""
Test simple de l'endpoint profile
"""

import requests
import json

def test_profile_simple():
    """Test simple de l'endpoint profile"""
    print("🧪 Test simple de l'endpoint profile...")
    
    base_url = "http://localhost:8000/api"
    
    # 1. Connexion pour obtenir un token
    print("\n1️⃣ Connexion...")
    login_data = {
        "email": "admin.hr@company.com",
        "password": "password123"
    }
    
    try:
        login_response = requests.post(f"{base_url}/auth/email/login", json=login_data)
        if login_response.status_code != 200:
            print(f"   ❌ Échec de la connexion: {login_response.text}")
            return
            
        login_result = login_response.json()
        token = login_result['data']['token']
        print(f"   ✅ Token obtenu: {token[:20]}...")
        
        # 2. Test direct du profil
        print("\n2️⃣ Test du profil...")
        
        headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
        
        profile_response = requests.get(f"{base_url}/auth/profile", headers=headers)
        print(f"   📊 Status: {profile_response.status_code}")
        print(f"   📋 Headers: {dict(profile_response.headers)}")
        
        if profile_response.status_code == 200:
            print("   ✅ Profil récupéré avec succès!")
            profile_data = profile_response.json()
            print(f"   📄 Données: {json.dumps(profile_data, indent=2)}")
        else:
            print(f"   ❌ Erreur: {profile_response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")

if __name__ == "__main__":
    test_profile_simple() 