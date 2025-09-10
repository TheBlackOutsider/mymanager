#!/usr/bin/env python3
"""
Script de test simple pour identifier le problème d'authentification
"""

import requests
import json

def test_simple_auth():
    """Test simple de l'authentification"""
    print("🧪 Test simple de l'authentification...")
    
    # Configuration
    API_BASE_URL = "http://localhost:8000/api"
    
    # Test de connexion
    login_data = {
        "email": "admin.hr@company.com",
        "password": "password123"
    }
    
    try:
        print(f"📡 Tentative de connexion à {API_BASE_URL}/auth/email/login")
        print(f"📝 Données envoyées: {login_data}")
        
        response = requests.post(
            f"{API_BASE_URL}/auth/email/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Connexion réussie!")
            print(f"📄 Réponse: {json.dumps(data, indent=2)}")
        else:
            print(f"❌ Erreur HTTP: {response.status_code}")
            try:
                error_data = response.json()
                print(f"📝 Détails de l'erreur: {json.dumps(error_data, indent=2)}")
            except:
                print(f"📝 Réponse brute: {response.text}")
                
    except requests.exceptions.ConnectionError:
        print("❌ Impossible de se connecter au serveur")
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")

if __name__ == "__main__":
    test_simple_auth() 