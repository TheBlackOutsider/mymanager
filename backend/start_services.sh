#!/bin/bash

# Script de d√©marrage des microservices HR Lead

echo "Ì∫Ä D√©marrage des microservices HR Lead..."

# V√©rification de Docker
if ! command -v docker &> /dev/null; then
    echo "‚ùå Docker n'est pas install√©"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "‚ùå Docker Compose n'est pas install√©"
    exit 1
fi

# Construction et d√©marrage des services
echo "Ì≥¶ Construction des images Docker..."
docker-compose build

echo "Ì¥Ñ D√©marrage des services..."
docker-compose up -d

# Attente du d√©marrage
echo "‚è≥ Attente du d√©marrage des services..."
sleep 10

# V√©rification du statut
echo "Ì≥ä Statut des services:"
docker-compose ps

# Test de l'API Gateway
echo "Ì¥ç Test de l'API Gateway..."
curl -s http://localhost:8000/health | jq . || echo "API Gateway non disponible"

echo "‚úÖ Services d√©marr√©s!"
echo "Ìºê API Gateway: http://localhost:8000"
echo "Ì≥ö Documentation: http://localhost:8000/docs"
echo "Ì¥ê Auth Service: http://localhost:8001"
echo "Ì±• Employee Service: http://localhost:8002"
echo "Ì≥Ö Event Service: http://localhost:8003"
echo "ÌøñÔ∏è Leave Service: http://localhost:8004"
echo "Ì¥î Notification Service: http://localhost:8005"
echo "Ì≥ä Report Service: http://localhost:8006"
