#!/usr/bin/env python3
"""
Script pour redémarrer le serveur FastAPI
"""

import os
import signal
import subprocess
import time

def restart_server():
    """Redémarre le serveur FastAPI"""
    print("🔄 Redémarrage du serveur FastAPI...")
    
    # 1. Trouver et arrêter le processus existant
    try:
        # Sur Windows, utiliser tasklist et taskkill
        result = subprocess.run(['tasklist', '/FI', 'IMAGENAME eq python.exe'], 
                              capture_output=True, text=True)
        
        if 'python.exe' in result.stdout:
            print("   🛑 Arrêt du processus Python existant...")
            subprocess.run(['taskkill', '/F', '/IM', 'python.exe'], 
                         capture_output=True)
            time.sleep(2)
    except Exception as e:
        print(f"   ⚠️ Erreur lors de l'arrêt: {e}")
    
    # 2. Redémarrer le serveur
    print("   🚀 Démarrage du nouveau serveur...")
    try:
        subprocess.Popen([
            'uvicorn', 'main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'
        ], cwd=os.getcwd())
        print("   ✅ Serveur redémarré avec succès!")
        print("   📍 URL: http://localhost:8000")
        print("   📚 API docs: http://localhost:8000/docs")
    except Exception as e:
        print(f"   ❌ Erreur lors du démarrage: {e}")

if __name__ == "__main__":
    restart_server() 