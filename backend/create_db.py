#!/usr/bin/env python3
"""
Script pour créer la base de données PostgreSQL avec les bons paramètres d'encodage
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

def create_database():
    try:
        # Connexion à la base postgres (base par défaut)
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            user="postgres",
            password="postgres",
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Vérifier si la base hrlead existe
        cursor.execute("SELECT 1 FROM pg_database WHERE datname = 'hrlead'")
        exists = cursor.fetchone()
        
        if not exists:
            print("Création de la base de données 'hrlead'...")
            cursor.execute("CREATE DATABASE hrlead WITH ENCODING 'UTF8' LC_COLLATE='C' LC_CTYPE='C'")
            print("Base de données 'hrlead' créée avec succès!")
        else:
            print("La base de données 'hrlead' existe déjà.")
        
        cursor.close()
        conn.close()
        
        # Tester la connexion à la nouvelle base
        print("Test de connexion à la base 'hrlead'...")
        test_conn = psycopg2.connect(
            host="localhost",
            port="5432",
            user="postgres",
            password="postgres",
            database="hrlead"
        )
        test_conn.close()
        print("Connexion à 'hrlead' réussie!")
        
    except Exception as e:
        print(f"Erreur: {e}")
        print("Vérifiez que PostgreSQL est démarré et accessible")

if __name__ == "__main__":
    create_database() 