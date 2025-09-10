#!/usr/bin/env python3
"""
Script de test détaillé de l'authentification avec debug
"""

import requests
import json
import traceback

def test_auth_debug():
    """Test détaillé de l'authentification"""
    print("🔍 Test détaillé de l'authentification...")
    
    url = "http://localhost:8000/api/auth/email/login"
    data = {
        "email": "admin.hr@company.com",
        "password": "password123"
    }
    
    try:
        print(f"📡 URL: {url}")
        print(f"📝 Données: {json.dumps(data, indent=2)}")
        
        # Test avec plus de détails
        response = requests.post(url, json=data, timeout=10)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Succès!")
            print(f"📄 Réponse: {response.json()}")
        else:
            print(f"❌ Erreur HTTP: {response.status_code}")
            print(f"📝 Réponse brute: {response.text}")
            
            # Essayer de parser la réponse JSON si possible
            try:
                error_json = response.json()
                print(f"📄 Erreur JSON: {json.dumps(error_json, indent=2)}")
            except:
                print("📄 Pas de JSON dans la réponse")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de requête: {str(e)}")
        traceback.print_exc()
    except Exception as e:
        print(f"❌ Erreur inattendue: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    test_auth_debug() 