#!/usr/bin/env python3
"""
Script pour vérifier la structure exacte de la réponse d'authentification
"""

import requests
import json

def debug_auth_response():
    """Debug de la réponse d'authentification"""
    print("🔍 Debug de la réponse d'authentification...")
    
    base_url = "http://localhost:8000/api"
    login_data = {
        "email": "admin.hr@company.com",
        "password": "password123"
    }
    
    try:
        response = requests.post(f"{base_url}/auth/email/login", json=login_data)
        print(f"📊 Status: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print("\n📄 Réponse complète:")
            print(json.dumps(result, indent=2, default=str))
            
            # Analyse de la structure
            print("\n🔍 Analyse de la structure:")
            if 'data' in result:
                data = result['data']
                print(f"   ✅ 'data' présent: {type(data)}")
                
                if 'token' in data:
                    print(f"   ✅ 'token' présent: {type(data['token'])} - {data['token'][:20]}...")
                else:
                    print("   ❌ 'token' absent")
                    
                if 'refreshToken' in data:
                    print(f"   ✅ 'refreshToken' présent: {type(data['refreshToken'])} - {data['refreshToken'][:20]}...")
                else:
                    print("   ❌ 'refreshToken' absent")
                    
                if 'user' in data:
                    print(f"   ✅ 'user' présent: {type(data['user'])}")
                    user = data['user']
                    if 'id' in user:
                        print(f"      - 'id': {type(user['id'])} - {user['id']}")
                    if 'role' in user:
                        print(f"      - 'role': {type(user['role'])} - {user['role']}")
                else:
                    print("   ❌ 'user' absent")
                    
                if 'permissions' in data:
                    print(f"   ✅ 'permissions' présent: {type(data['permissions'])} - {len(data['permissions'])} éléments")
                else:
                    print("   ❌ 'permissions' absent")
            else:
                print("   ❌ 'data' absent")
        else:
            print(f"❌ Erreur: {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")

if __name__ == "__main__":
    debug_auth_response() 