#!/bin/bash

# Script de déploiement en production pour HR Lead Microservices

echo "� Déploiement en production HR Lead Microservices..."

# Vérification des prérequis
echo "� Vérification des prérequis..."

if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Vérification des variables d'environnement
if [ ! -f "backend/.env.production" ]; then
    echo "❌ Fichier .env.production manquant"
    echo "� Copiez .env.example vers .env.production et configurez-le"
    exit 1
fi

# Sauvegarde de la base de données existante
echo "� Sauvegarde de la base de données..."
if docker-compose -f docker-compose.production.yml ps postgres-prod | grep -q "Up"; then
    docker-compose -f docker-compose.production.yml exec postgres-prod pg_dump -U hrlead_prod hrlead_prod > backup/pre-deployment-$(date +%Y%m%d_%H%M%S).sql
    echo "✅ Sauvegarde créée"
fi

# Arrêt des services existants
echo "� Arrêt des services existants..."
docker-compose -f docker-compose.production.yml down

# Construction des nouvelles images
echo "� Construction des images de production..."
docker-compose -f docker-compose.production.yml build --no-cache

# Démarrage des services
echo "� Démarrage des services de production..."
docker-compose -f docker-compose.production.yml up -d

# Attente du démarrage
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérification du statut
echo "� Vérification du statut des services..."
docker-compose -f docker-compose.production.yml ps

# Test de santé des services
echo "� Test de santé des services..."
for service in api-gateway-prod auth-service-prod employee-service-prod event-service-prod leave-service-prod notification-service-prod report-service-prod; do
    if docker-compose -f docker-compose.production.yml ps $service | grep -q "Up"; then
        echo "✅ $service: OK"
    else
        echo "❌ $service: ERREUR"
    fi
done

# Test de l'API Gateway
echo "� Test de l'API Gateway..."
if curl -s http://localhost/health | grep -q "healthy"; then
    echo "✅ API Gateway accessible"
else
    echo "❌ API Gateway non accessible"
fi

# Nettoyage des images inutilisées
echo "� Nettoyage des images Docker..."
docker image prune -f

echo "✅ Déploiement terminé!"
echo "� Application accessible sur: http://localhost"
echo "� Documentation API: http://localhost/docs"
echo "� Monitoring: http://localhost:9090"

# Affichage des logs en cas d'erreur
if ! docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    echo "⚠️ Certains services ne sont pas démarrés. Vérifiez les logs:"
    docker-compose -f docker-compose.production.yml logs
fi
