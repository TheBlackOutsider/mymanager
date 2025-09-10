#!/usr/bin/env python3
"""
Test de connexion PostgreSQL avec paramètres d'encodage forcés
"""

import psycopg2
import os

def test_postgres_connection():
    # Forcer l'encodage des variables d'environnement
    os.environ['LANG'] = 'C'
    os.environ['LC_ALL'] = 'C'
    os.environ['LC_MESSAGES'] = 'C'
    os.environ['LC_CTYPE'] = 'C'
    os.environ['LC_COLLATE'] = 'C'
    
    try:
        print("Test de connexion avec paramètres d'encodage forcés...")
        
        # Test 1: Connexion à la base postgres
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            user="postgres",
            password="postgres",
            database="postgres",
            options="-c client_encoding=UTF8 -c lc_messages=C -c lc_ctype=C -c lc_collate=C"
        )
        print("✓ Connexion à 'postgres' réussie!")
        conn.close()
        
        # Test 2: Création de la base hrlead si elle n'existe pas
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            user="postgres",
            password="postgres",
            database="postgres",
            options="-c client_encoding=UTF8 -c lc_messages=C -c lc_ctype=C -c lc_collate=C"
        )
        conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Vérifier si hrlead existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'hrlead'")
        exists = cursor.fetchone()
        
        if not exists:
            print("Création de la base 'hrlead'...")
            cursor.execute("CREATE DATABASE hrlead WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C'")
            print("✓ Base 'hrlead' créée!")
        else:
            print("✓ Base 'hrlead' existe déjà")
        
        cursor.close()
        conn.close()
        
        # Test 3: Connexion à hrlead
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            user="postgres",
            password="postgres",
            database="hrlead",
            options="-c client_encoding=UTF8 -c lc_messages=C -c lc_ctype=C -c lc_collate=C"
        )
        print("✓ Connexion à 'hrlead' réussie!")
        conn.close()
        
        print("\n🎉 Tous les tests PostgreSQL sont réussis!")
        return True
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    test_postgres_connection() 