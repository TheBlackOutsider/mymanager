# Architecture Microservices HR Lead

## Vue d'ensemble

Cette application utilise une architecture microservices avec le pattern Singleton pour chaque service. Chaque service est indépendant et communique via l'API Gateway.

## Structure des Services

### 1. API Gateway (Port 8000)
- **Rôle**: Point d'entrée unique pour tous les clients
- **Fonctionnalités**:
  - Routage des requêtes vers les microservices appropriés
  - Authentification centralisée
  - Rate limiting
  - Logging des requêtes
  - Health checks

### 2. Auth Service (Port 8001)
- **Rôle**: Gestion de l'authentification et autorisation
- **Fonctionnalités**:
  - Connexion utilisateur (email/password)
  - Génération et validation des tokens JWT
  - Gestion des permissions par rôle
  - Pattern Singleton pour la sécurité

### 3. Employee Service (Port 8002)
- **Rôle**: Gestion des employés
- **Fonctionnalités**:
  - CRUD des employés
  - Recherche et filtrage
  - Gestion des départements
  - Pattern Singleton pour la cohérence des données

### 4. Event Service (Port 8003)
- **Rôle**: Gestion des événements RH
- **Fonctionnalités**:
  - CRUD des événements
  - Gestion des participants
  - Événements récurrents
  - Pattern Singleton pour la synchronisation

### 5. Leave Service (Port 8004)
- **Rôle**: Gestion des congés
- **Fonctionnalités**:
  - Demandes de congés
  - Approbation/rejet
  - Vérification des conflits
  - Pattern Singleton pour la logique métier

### 6. Notification Service (Port 8005)
- **Rôle**: Gestion des notifications
- **Fonctionnalités**:
  - Notifications push
  - Emails automatiques
  - Rappels d'événements
  - Pattern Singleton pour la cohérence

### 7. Report Service (Port 8006)
- **Rôle**: Génération de rapports
- **Fonctionnalités**:
  - Rapports PDF/CSV
  - Analytics
  - Exports de données
  - Pattern Singleton pour le cache

## Pattern Singleton

Chaque service implémente le pattern Singleton pour garantir :
- **Une seule instance** du service par conteneur
- **État partagé** entre les requêtes
- **Configuration centralisée**
- **Performance optimisée**

## Base de Données

- **PostgreSQL**: Base de données principale
- **Redis**: Cache et sessions
- **Modèles partagés**: Dans le dossier `shared/models/`

## Déploiement

### Avec Docker Compose

```bash
# Démarrer tous les services
docker-compose up -d

# Vérifier le statut
docker-compose ps

# Logs d'un service spécifique
docker-compose logs auth-service
```

### Services individuels

```bash
# API Gateway
python -m api-gateway.main

# Auth Service
python -m services.auth-service.main

# Employee Service
python -m services.employee-service.main
```

## Endpoints Principaux

### API Gateway
- `GET /` - Informations générales
- `GET /health` - Statut des services
- `POST /api/auth/login` - Connexion
- `GET /api/employees/` - Liste des employés
- `POST /api/events/` - Créer un événement
- `GET /api/leaves/` - Liste des congés

### Services individuels
Chaque service expose ses propres endpoints sur son port dédié.

## Sécurité

- **JWT Tokens**: Authentification stateless
- **CORS**: Configuration appropriée
- **Rate Limiting**: Protection contre les abus
- **Validation**: Pydantic pour la validation des données
- **Audit Trail**: Logs de sécurité

## Monitoring

- **Health Checks**: Chaque service expose `/health`
- **Logging**: Logs centralisés via l'API Gateway
- **Metrics**: Métriques de performance par service

## Avantages de cette Architecture

1. **Scalabilité**: Chaque service peut être mis à l'échelle indépendamment
2. **Maintenabilité**: Code modulaire et séparation des responsabilités
3. **Fiabilité**: Isolation des pannes
4. **Performance**: Pattern Singleton optimise les ressources
5. **Sécurité**: Authentification centralisée et contrôlée
