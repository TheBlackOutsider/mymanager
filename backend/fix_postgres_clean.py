#!/usr/bin/env python3
"""
Script pour nettoyer et réinstaller PostgreSQL proprement
"""

import subprocess
import os

def clean_postgres():
    print("🧹 Nettoyage complet de PostgreSQL...")
    
    # 1. Arrêter tous les services PostgreSQL
    print("1. Arrêt des services PostgreSQL...")
    services = ["postgresql-x64-17", "postgresql-x64-13"]
    
    for service in services:
        try:
            subprocess.run(["net", "stop", service], check=True, capture_output=True)
            print(f"✓ Service {service} arrêté")
        except:
            print(f"⚠ Service {service} déjà arrêté ou inexistant")
    
    # 2. Désinstaller PostgreSQL via Windows
    print("\n2. Désinstallation de PostgreSQL...")
    print("⚠ ATTENTION: Vous devez désinstaller PostgreSQL manuellement via:")
    print("   - Panneau de configuration > Programmes > Désinstaller un programme")
    print("   - Ou via PowerShell: Get-WmiObject -Class Win32_Product | Where-Object {$_.Name -like '*PostgreSQL*'} | ForEach-Object {$_.Uninstall()}")
    
    # 3. Nettoyer les dossiers résiduels
    print("\n3. Nettoyage des dossiers résiduels...")
    residual_paths = [
        "C:/Program Files/PostgreSQL",
        "C:/Program Files (x86)/PostgreSQL",
        "C:/Users/matheos.djidonou/AppData/Roaming/postgresql",
        "C:/Users/matheos.djidonou/AppData/Local/postgresql"
    ]
    
    for path in residual_paths:
        if os.path.exists(path):
            try:
                import shutil
                shutil.rmtree(path)
                print(f"✓ Dossier supprimé: {path}")
            except Exception as e:
                print(f"⚠ Erreur suppression {path}: {e}")
    
    # 4. Instructions de réinstallation
    print("\n🎯 INSTRUCTIONS DE RÉINSTALLATION:")
    print("1. Téléchargez PostgreSQL 17 depuis: https://www.postgresql.org/download/windows/")
    print("2. Pendant l'installation, utilisez ces paramètres:")
    print("   - Port: 5432")
    print("   - Mot de passe: postgres")
    print("   - Locale: C (pas de français)")
    print("   - Encoding: UTF8")
    print("3. Décochez Stack Builder à la fin")
    print("4. Redémarrez votre ordinateur")
    print("5. Testez la connexion avec: python test_postgres.py")

if __name__ == "__main__":
    clean_postgres() 