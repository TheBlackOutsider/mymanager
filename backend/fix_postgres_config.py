#!/usr/bin/env python3
"""
Script pour corriger la configuration PostgreSQL système
"""

import subprocess
import os

def fix_postgres_config():
    print("🔧 Correction de la configuration PostgreSQL...")
    
    # 1. Arrêter le service PostgreSQL
    print("1. Arrêt du service PostgreSQL...")
    try:
        subprocess.run(["net", "stop", "postgresql-x64-17"], check=True, capture_output=True)
        print("✓ Service PostgreSQL 17 arrêté")
    except:
        print("⚠ Service PostgreSQL 17 déjà arrêté ou erreur")
    
    try:
        subprocess.run(["net", "stop", "postgresql-x64-13"], check=True, capture_output=True)
        print("✓ Service PostgreSQL 13 arrêté")
    except:
        print("⚠ Service PostgreSQL 13 déjà arrêté ou erreur")
    
    # 2. Modifier le fichier postgresql.conf
    print("\n2. Modification de postgresql.conf...")
    
    # Chercher les fichiers de configuration
    config_paths = [
        "C:/Program Files/PostgreSQL/17/data/postgresql.conf",
        "C:/Program Files/PostgreSQL/13/data/postgresql.conf",
        "C:/Program Files (x86)/PostgreSQL/17/data/postgresql.conf",
        "C:/Program Files (x86)/PostgreSQL/13/data/postgresql.conf"
    ]
    
    for config_path in config_paths:
        if os.path.exists(config_path):
            print(f"Fichier trouvé: {config_path}")
            
            # Lire le contenu
            with open(config_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Ajouter/modifier les paramètres d'encodage
            encoding_settings = """
# Configuration d'encodage forcée
lc_messages = 'C'
lc_monetary = 'C'
lc_numeric = 'C'
lc_time = 'C'
client_min_messages = 'error'
log_min_messages = 'error'
"""
            
            if 'lc_messages' not in content:
                with open(config_path, 'a', encoding='utf-8') as f:
                    f.write(encoding_settings)
                print(f"✓ Paramètres d'encodage ajoutés à {config_path}")
            else:
                print(f"⚠ Paramètres d'encodage déjà présents dans {config_path}")
    
    # 3. Redémarrer le service
    print("\n3. Redémarrage du service PostgreSQL...")
    try:
        subprocess.run(["net", "start", "postgresql-x64-17"], check=True, capture_output=True)
        print("✓ Service PostgreSQL 17 redémarré")
    except:
        print("⚠ Erreur lors du redémarrage de PostgreSQL 17")
    
    print("\n🎯 Configuration PostgreSQL corrigée!")
    print("Essayez maintenant de démarrer le backend...")

if __name__ == "__main__":
    fix_postgres_config() 