#!/bin/bash

# Script de démarrage des microservices HR Lead

echo "� Démarrage des microservices HR Lead..."

# Vérification de Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Construction et démarrage des services
echo "� Construction des images Docker..."
docker-compose build

echo "� Démarrage des services..."
docker-compose up -d

# Attente du démarrage
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérification du statut
echo "� Statut des services:"
docker-compose ps

# Test de l'API Gateway
echo "� Test de l'API Gateway..."
curl -s http://localhost:8000/health | jq . || echo "API Gateway non disponible"

echo "✅ Services démarrés!"
echo "� API Gateway: http://localhost:8000"
echo "� Documentation: http://localhost:8000/docs"
echo "� Auth Service: http://localhost:8001"
echo "� Employee Service: http://localhost:8002"
echo "� Event Service: http://localhost:8003"
echo "�️ Leave Service: http://localhost:8004"
echo "� Notification Service: http://localhost:8005"
echo "� Report Service: http://localhost:8006"
