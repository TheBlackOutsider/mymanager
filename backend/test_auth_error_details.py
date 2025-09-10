#!/usr/bin/env python3
"""
Script pour capturer les détails de l'erreur 500
"""

import requests
import json

def test_auth_with_error_details():
    """Test avec capture des détails d'erreur"""
    print("🔍 Test avec capture des détails d'erreur...")
    
    url = "http://localhost:8000/api/auth/email/login"
    data = {
        "email": "admin.hr@company.com",
        "password": "password123"
    }
    
    try:
        # Test avec différents headers pour plus d'informations
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'TestClient/1.0'
        }
        
        print(f"📡 URL: {url}")
        print(f"📝 Données: {json.dumps(data, indent=2)}")
        print(f"📋 Headers: {json.dumps(headers, indent=2)}")
        
        response = requests.post(url, json=data, headers=headers, timeout=15)
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers de réponse: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Succès!")
            print(f"📄 Réponse: {response.json()}")
        else:
            print(f"❌ Erreur HTTP: {response.status_code}")
            print(f"📝 Réponse brute: {response.text}")
            
            # Essayer de parser la réponse JSON
            try:
                error_json = response.json()
                print(f"📄 Erreur JSON: {json.dumps(error_json, indent=2)}")
            except:
                print("📄 Pas de JSON dans la réponse")
                
            # Vérifier si c'est une erreur de validation
            if response.status_code == 422:
                print("🔍 Erreur de validation des données")
            elif response.status_code == 500:
                print("🔍 Erreur interne du serveur - vérifiez les logs du serveur")
                
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de requête: {str(e)}")
    except Exception as e:
        print(f"❌ Erreur inattendue: {str(e)}")

if __name__ == "__main__":
    test_auth_with_error_details() 