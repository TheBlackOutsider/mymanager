#!/bin/bash

# Script de d√©ploiement en production pour HR Lead Microservices

echo "Ì∫Ä D√©ploiement en production HR Lead Microservices..."

# V√©rification des pr√©requis
echo "Ì¥ç V√©rification des pr√©requis..."

if ! command -v docker &> /dev/null; then
    echo "‚ùå Docker n'est pas install√©"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "‚ùå Docker Compose n'est pas install√©"
    exit 1
fi

# V√©rification des variables d'environnement
if [ ! -f "backend/.env.production" ]; then
    echo "‚ùå Fichier .env.production manquant"
    echo "Ì≥ù Copiez .env.example vers .env.production et configurez-le"
    exit 1
fi

# Sauvegarde de la base de donn√©es existante
echo "Ì≤æ Sauvegarde de la base de donn√©es..."
if docker-compose -f docker-compose.production.yml ps postgres-prod | grep -q "Up"; then
    docker-compose -f docker-compose.production.yml exec postgres-prod pg_dump -U hrlead_prod hrlead_prod > backup/pre-deployment-$(date +%Y%m%d_%H%M%S).sql
    echo "‚úÖ Sauvegarde cr√©√©e"
fi

# Arr√™t des services existants
echo "Ìªë Arr√™t des services existants..."
docker-compose -f docker-compose.production.yml down

# Construction des nouvelles images
echo "Ì≥¶ Construction des images de production..."
docker-compose -f docker-compose.production.yml build --no-cache

# D√©marrage des services
echo "Ì¥Ñ D√©marrage des services de production..."
docker-compose -f docker-compose.production.yml up -d

# Attente du d√©marrage
echo "‚è≥ Attente du d√©marrage des services..."
sleep 30

# V√©rification du statut
echo "Ì≥ä V√©rification du statut des services..."
docker-compose -f docker-compose.production.yml ps

# Test de sant√© des services
echo "Ì¥ç Test de sant√© des services..."
for service in api-gateway-prod auth-service-prod employee-service-prod event-service-prod leave-service-prod notification-service-prod report-service-prod; do
    if docker-compose -f docker-compose.production.yml ps $service | grep -q "Up"; then
        echo "‚úÖ $service: OK"
    else
        echo "‚ùå $service: ERREUR"
    fi
done

# Test de l'API Gateway
echo "Ìºê Test de l'API Gateway..."
if curl -s http://localhost/health | grep -q "healthy"; then
    echo "‚úÖ API Gateway accessible"
else
    echo "‚ùå API Gateway non accessible"
fi

# Nettoyage des images inutilis√©es
echo "Ì∑π Nettoyage des images Docker..."
docker image prune -f

echo "‚úÖ D√©ploiement termin√©!"
echo "Ìºê Application accessible sur: http://localhost"
echo "Ì≥ö Documentation API: http://localhost/docs"
echo "Ì≥ä Monitoring: http://localhost:9090"

# Affichage des logs en cas d'erreur
if ! docker-compose -f docker-compose.production.yml ps | grep -q "Up"; then
    echo "‚ö†Ô∏è Certains services ne sont pas d√©marr√©s. V√©rifiez les logs:"
    docker-compose -f docker-compose.production.yml logs
fi
