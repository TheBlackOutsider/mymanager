#!/usr/bin/env python3
"""
Script de test final de l'authentification
"""

import requests
import json

def test_auth_final():
    """Test final de l'authentification"""
    print("🎯 Test final de l'authentification...")
    
    url = "http://localhost:8000/api/auth/email/login"
    data = {
        "email": "admin.hr@company.com",
        "password": "password123"
    }
    
    try:
        print(f"📡 URL: {url}")
        print(f"📝 Données: {json.dumps(data, indent=2)}")
        
        # Test avec plus de détails
        response = requests.post(url, json=data, timeout=15)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Succès!")
            result = response.json()
            print(f"📄 Réponse: {json.dumps(result, indent=2)}")
            
            # Vérifier les permissions
            if 'data' in result and 'permissions' in result['data']:
                permissions = result['data']['permissions']
                print(f"🔑 Permissions reçues: {len(permissions)}")
                for i, perm in enumerate(permissions[:5]):  # Afficher les 5 premières
                    print(f"   {i+1}. {perm}")
        else:
            print(f"❌ Erreur HTTP: {response.status_code}")
            print(f"📝 Réponse brute: {response.text}")
            
            # Essayer de parser la réponse JSON
            try:
                error_json = response.json()
                print(f"📄 Erreur JSON: {json.dumps(error_json, indent=2)}")
            except:
                print("📄 Pas de JSON dans la réponse")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de requête: {str(e)}")
    except Exception as e:
        print(f"❌ Erreur inattendue: {str(e)}")

if __name__ == "__main__":
    test_auth_final() 