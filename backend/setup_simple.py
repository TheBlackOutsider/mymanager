#!/usr/bin/env python3
"""
Script simple de configuration PostgreSQL pour HRlead
"""

import os
import subprocess
import sys

def set_environment_variables():
    """Configure les variables d'environnement pour PostgreSQL"""
    
    # Configuration PostgreSQL
    os.environ['DATABASE_URL'] = 'postgresql://postgres:postgres@localhost:5432/hrlead'
    os.environ['JWT_SECRET_KEY'] = 'hrlead-super-secret-key-2024-change-in-production'
    os.environ['LDAP_ENABLED'] = 'false'
    os.environ['EMAIL_ENABLED'] = 'false'
    os.environ['PUSH_ENABLED'] = 'false'
    os.environ['SSO_ENABLED'] = 'false'
    
    print("✅ Variables d'environnement configurées:")
    print(f"   DATABASE_URL: {os.environ['DATABASE_URL']}")
    print(f"   JWT_SECRET_KEY: {os.environ['JWT_SECRET_KEY']}")
    print(f"   LDAP_ENABLED: {os.environ['LDAP_ENABLED']}")

def create_database_simple():
    """Crée la base de données avec psql"""
    
    # Commande pour créer la base de données
    create_db_cmd = [
        "C:/Program Files/PostgreSQL/17/bin/psql.exe",
        "-U", "postgres",
        "-h", "localhost",
        "-p", "5432",
        "-c", "CREATE DATABASE hrlead;"
    ]
    
    try:
        print("🔧 Création de la base de données 'hrlead'...")
        
        # Exécution de la commande
        result = subprocess.run(
            create_db_cmd,
            capture_output=True,
            text=True,
            env=os.environ
        )
        
        if result.returncode == 0:
            print("✅ Base de données 'hrlead' créée avec succès!")
            return True
        else:
            if "already exists" in result.stderr or "existe déjà" in result.stderr:
                print("✅ La base de données 'hrlead' existe déjà!")
                return True
            else:
                print(f"❌ Erreur: {result.stderr}")
                return False
                
    except Exception as e:
        print(f"❌ Erreur lors de la création: {e}")
        return False

def test_connection():
    """Teste la connexion à la base de données"""
    
    test_cmd = [
        "C:/Program Files/PostgreSQL/17/bin/psql.exe",
        "-U", "postgres",
        "-h", "localhost",
        "-p", "5432",
        "-d", "hrlead",
        "-c", "SELECT version();"
    ]
    
    try:
        print("🔍 Test de connexion à PostgreSQL...")
        
        result = subprocess.run(
            test_cmd,
            capture_output=True,
            text=True,
            env=os.environ
        )
        
        if result.returncode == 0:
            print("✅ Connexion réussie à PostgreSQL!")
            print(f"Version: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ Erreur de connexion: {result.stderr}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors du test: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Configuration PostgreSQL pour HRlead")
    print("=" * 50)
    
    # Configuration des variables d'environnement
    set_environment_variables()
    
    # Création de la base de données
    if not create_database_simple():
        print("❌ Impossible de créer la base de données")
        return
    
    # Test de connexion
    if not test_connection():
        print("❌ Impossible de se connecter")
        return
    
    print("\n🎉 Configuration PostgreSQL terminée avec succès!")
    print("\n📋 Prochaines étapes:")
    print("1. Démarrer le backend: python main.py")
    print("2. Les tables seront créées automatiquement")
    print("3. Tester l'API: http://localhost:8000/docs")
    
    print(f"\n🔗 URL de connexion: {os.environ['DATABASE_URL']}")

if __name__ == "__main__":
    main() 