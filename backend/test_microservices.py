#!/usr/bin/env python3
"""
Script de test pour vérifier le bon fonctionnement des microservices
"""

import requests
import json
import time
from typing import Dict, Any

class MicroservicesTester:
    def __init__(self):
        self.base_urls = {
            "gateway": "http://localhost:8000",
            "auth": "http://localhost:8001",
            "employee": "http://localhost:8002",
            "event": "http://localhost:8003",
            "leave": "http://localhost:8004",
            "notification": "http://localhost:8005",
            "report": "http://localhost:8006"
        }
        self.token = None
    
    def test_service_health(self, service_name: str, url: str) -> bool:
        """Test de santé d'un service"""
        try:
            response = requests.get(f"{url}/health", timeout=5)
            if response.status_code == 200:
                print(f"✅ {service_name} service: OK")
                return True
            else:
                print(f"❌ {service_name} service: Erreur {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ {service_name} service: {str(e)}")
            return False
    
    def test_gateway_health(self) -> bool:
        """Test de santé du gateway"""
        try:
            response = requests.get(f"{self.base_urls['gateway']}/health", timeout=5)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ API Gateway: OK")
                print(f"��� Services status: {data.get('services', {})}")
                return True
            else:
                print(f"❌ API Gateway: Erreur {response.status_code}")
                return False
        except requests.exceptions.RequestException as e:
            print(f"❌ API Gateway: {str(e)}")
            return False
    
    def test_auth_service(self) -> bool:
        """Test du service d'authentification"""
        try:
            # Test de création d'utilisateur
            user_data = {
                "name": "Test User",
                "email": "test@company.com",
                "password": "test123",
                "department": "IT",
                "job_title": "Developer",
                "seniority": "Mid"
            }
            
            response = requests.post(
                f"{self.base_urls['auth']}/api/auth/register",
                json=user_data,
                timeout=5
            )
            
            if response.status_code in [200, 201, 400]:  # 400 si utilisateur existe déjà
                print("✅ Auth Service: Registration endpoint OK")
                
                # Test de connexion
                login_data = {
                    "email": "test@company.com",
                    "password": "test123"
                }
                
                response = requests.post(
                    f"{self.base_urls['auth']}/api/auth/login",
                    json=login_data,
                    timeout=5
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get('success') and data.get('data', {}).get('token'):
                        self.token = data['data']['token']
                        print("✅ Auth Service: Login endpoint OK")
                        return True
                    else:
                        print("❌ Auth Service: Login failed - no token")
                        return False
                else:
                    print(f"❌ Auth Service: Login error {response.status_code}")
                    return False
            else:
                print(f"❌ Auth Service: Registration error {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Auth Service: {str(e)}")
            return False
    
    def test_employee_service(self) -> bool:
        """Test du service des employés"""
        try:
            headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
            
            response = requests.get(
                f"{self.base_urls['employee']}/api/employees/",
                headers=headers,
                timeout=5
            )
            
            if response.status_code in [200, 401]:  # 401 si pas de token
                print("✅ Employee Service: Endpoint accessible")
                return True
            else:
                print(f"❌ Employee Service: Error {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Employee Service: {str(e)}")
            return False
    
    def test_gateway_proxy(self) -> bool:
        """Test du proxy du gateway"""
        try:
            headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
            
            response = requests.get(
                f"{self.base_urls['gateway']}/api/employees/",
                headers=headers,
                timeout=5
            )
            
            if response.status_code in [200, 401]:  # 401 si pas de token
                print("✅ Gateway Proxy: Employee service proxy OK")
                return True
            else:
                print(f"❌ Gateway Proxy: Error {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Gateway Proxy: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Exécution de tous les tests"""
        print("��� Test des microservices HR Lead")
        print("=" * 50)
        
        # Test de santé des services
        print("\n��� Test de santé des services:")
        health_results = []
        for service_name, url in self.base_urls.items():
            if service_name == "gateway":
                health_results.append(self.test_gateway_health())
            else:
                health_results.append(self.test_service_health(service_name, url))
        
        # Test fonctionnel
        print("\n��� Test fonctionnel:")
        auth_result = self.test_auth_service()
        employee_result = self.test_employee_service()
        proxy_result = self.test_gateway_proxy()
        
        # Résumé
        print("\n��� Résumé des tests:")
        total_tests = len(health_results) + 3
        passed_tests = sum(health_results) + sum([auth_result, employee_result, proxy_result])
        
        print(f"Tests réussis: {passed_tests}/{total_tests}")
        
        if passed_tests == total_tests:
            print("��� Tous les tests sont passés!")
            return True
        else:
            print("⚠️ Certains tests ont échoué")
            return False

def main():
    tester = MicroservicesTester()
    success = tester.run_all_tests()
    exit(0 if success else 1)

if __name__ == "__main__":
    main()
