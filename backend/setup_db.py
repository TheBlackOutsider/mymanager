#!/usr/bin/env python3
"""
Script de configuration de la base de données PostgreSQL pour HRlead
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import sys
import os

# Configuration de la base de données
DB_CONFIG = {
    'host': 'localhost',
    'port': 5432,
    'user': 'postgres',
    'password': 'postgres',  # Changez ceci selon votre configuration
    'database': 'hrlead'
}

def create_database():
    """Crée la base de données HRlead"""
    try:
        # Connexion à PostgreSQL (sans spécifier de base)
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Vérification si la base existe déjà
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_CONFIG['database'],))
        exists = cursor.fetchone()
        
        if not exists:
            print(f"Création de la base de données '{DB_CONFIG['database']}'...")
            cursor.execute(f"CREATE DATABASE {DB_CONFIG['database']}")
            print(f"✅ Base de données '{DB_CONFIG['database']}' créée avec succès!")
        else:
            print(f"✅ La base de données '{DB_CONFIG['database']}' existe déjà!")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Erreur lors de la création de la base de données: {e}")
        return False

def create_user():
    """Crée un utilisateur dédié pour HRlead (optionnel)"""
    try:
        # Connexion à PostgreSQL
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password']
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Vérification si l'utilisateur existe déjà
        cursor.execute("SELECT 1 FROM pg_user WHERE usename = 'hrlead_user'")
        exists = cursor.fetchone()
        
        if not exists:
            print("Création de l'utilisateur 'hrlead_user'...")
            cursor.execute("CREATE USER hrlead_user WITH PASSWORD 'hrlead_password'")
            cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {DB_CONFIG['database']} TO hrlead_user")
            print("✅ Utilisateur 'hrlead_user' créé avec succès!")
        else:
            print("✅ L'utilisateur 'hrlead_user' existe déjà!")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Erreur lors de la création de l'utilisateur: {e}")
        return False

def test_connection():
    """Teste la connexion à la base de données"""
    try:
        # Connexion à la base HRlead
        conn = psycopg2.connect(
            host=DB_CONFIG['host'],
            port=DB_CONFIG['port'],
            user=DB_CONFIG['user'],
            password=DB_CONFIG['password'],
            database=DB_CONFIG['database']
        )
        
        cursor = conn.cursor()
        cursor.execute("SELECT version();")
        version = cursor.fetchone()
        
        print(f"✅ Connexion réussie à PostgreSQL!")
        print(f"Version: {version[0]}")
        
        cursor.close()
        conn.close()
        return True
        
    except psycopg2.Error as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

def update_config():
    """Met à jour le fichier de configuration avec les informations de connexion"""
    config_content = f'''# Configuration PostgreSQL pour HRlead
DATABASE_URL=postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}

# Configuration JWT
JWT_SECRET_KEY=hrlead-super-secret-key-2024-change-in-production

# Configuration LDAP
LDAP_ENABLED=false
LDAP_SERVER=ldap://localhost
LDAP_PORT=389
LDAP_BASE_DN=dc=example,dc=com
LDAP_BIND_DN=
LDAP_BIND_PASSWORD=
LDAP_USER_SEARCH_BASE=ou=users
LDAP_USER_SEARCH_FILTER=(uid={{}})

# Configuration Email
EMAIL_ENABLED=false
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_SMTP_PORT=587
EMAIL_USERNAME=
EMAIL_PASSWORD=
EMAIL_FROM=

# Configuration Push Notifications
PUSH_ENABLED=false
PUSH_VAPID_PUBLIC_KEY=
PUSH_VAPID_PRIVATE_KEY=

# Configuration SSO
SSO_ENABLED=false
SSO_PROVIDER=azure
SSO_CLIENT_ID=
SSO_CLIENT_SECRET=
SSO_TENANT_ID=
'''
    
    try:
        with open('.env', 'w') as f:
            f.write(config_content)
        print("✅ Fichier .env créé avec la configuration PostgreSQL!")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la création du fichier .env: {e}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Configuration de PostgreSQL pour HRlead")
    print("=" * 50)
    
    # Vérification des paramètres
    if len(sys.argv) > 1:
        if sys.argv[1] == '--password':
            DB_CONFIG['password'] = sys.argv[2]
            print(f"Mot de passe PostgreSQL défini: {DB_CONFIG['password']}")
    
    # Création de la base de données
    if not create_database():
        print("❌ Impossible de continuer sans base de données")
        return
    
    # Création de l'utilisateur (optionnel)
    create_user()
    
    # Test de connexion
    if not test_connection():
        print("❌ Impossible de se connecter à la base de données")
        return
    
    # Mise à jour de la configuration
    update_config()
    
    print("\n🎉 Configuration PostgreSQL terminée avec succès!")
    print("\n📋 Prochaines étapes:")
    print("1. Démarrer le backend: python main.py")
    print("2. Les tables seront créées automatiquement")
    print("3. Tester l'API: http://localhost:8000/docs")
    
    print(f"\n🔗 URL de connexion: postgresql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}")

if __name__ == "__main__":
    main() 