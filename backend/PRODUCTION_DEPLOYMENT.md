# Guide de Déploiement Production - HR Lead Microservices

## ��� Déploiement en Production

### Prérequis

1. **Serveur de production** avec Docker et Docker Compose
2. **Base de données PostgreSQL** configurée
3. **Redis** pour le cache
4. **Certificats SSL** pour HTTPS
5. **Variables d'environnement** configurées

### Configuration Production

#### 1. Variables d'Environnement

Copiez `.env.example` vers `.env.production` et configurez :

```bash
# Sécurité
JWT_SECRET_KEY=your-super-secure-secret-key-change-this-in-production
JWT_ALGORITHM=HS256

# Base de données
DATABASE_URL=postgresql://hrlead_prod:secure_password@prod-db:5432/hrlead_prod

# Email
SMTP_SERVER=smtp.company.com
SMTP_USERNAME=noreply@company.com
SMTP_PASSWORD=secure_email_password

# LDAP
LDAP_ENABLED=true
LDAP_SERVER=ldap://ldap.company.com
```

#### 2. Déploiement avec Docker Compose

```bash
# Déploiement automatique
./deploy_production.sh

# Ou manuellement
docker-compose -f docker-compose.production.yml up -d
```

#### 3. Vérification du Déploiement

```bash
# Statut des services
docker-compose -f docker-compose.production.yml ps

# Logs
docker-compose -f docker-compose.production.yml logs -f

# Test de santé
curl http://localhost/health
```

## ��� Configuration Avancée

### Load Balancer Nginx

Configuration recommandée pour la production :

```nginx
upstream api_gateway {
    server api-gateway-prod:8000;
}

server {
    listen 80;
    listen 443 ssl;
    
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    location / {
        proxy_pass http://api_gateway;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Monitoring et Logs

#### Prometheus (Optionnel)

```yaml
prometheus:
  image: prom/prometheus
  ports:
    - "9090:9090"
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
```

#### Logs Centralisés

```bash
# Configuration des logs
export LOG_LEVEL=INFO
export LOG_FILE=/var/log/hrlead/app.log

# Rotation des logs
logrotate /etc/logrotate.d/hrlead
```

## ��� Sécurité Production

### 1. Sécurité des Secrets

- **JWT Secret** : Utilisez une clé forte et unique
- **Mots de passe DB** : Complexes et uniques
- **Certificats SSL** : Renouvelés régulièrement

### 2. Firewall et Réseau

```bash
# Ouverture des ports nécessaires
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw deny 8001:8006/tcp  # Ports des services internes
```

### 3. Rate Limiting

Configuration dans l'API Gateway :

```python
RATE_LIMIT_PER_MINUTE = 100
MAX_REQUEST_SIZE = 10485760  # 10MB
```

## ��� Monitoring Production

### Métriques Importantes

1. **Performance** :
   - Temps de réponse API
   - Throughput des requêtes
   - Utilisation CPU/Mémoire

2. **Sécurité** :
   - Tentatives de connexion échouées
   - Requêtes suspectes
   - Erreurs d'authentification

3. **Disponibilité** :
   - Uptime des services
   - Erreurs 5xx
   - Connexions DB

### Alertes Recommandées

```yaml
alerts:
  - name: ServiceDown
    condition: up == 0
    severity: critical
    
  - name: HighErrorRate
    condition: error_rate > 0.05
    severity: warning
    
  - name: HighResponseTime
    condition: response_time > 2s
    severity: warning
```

## ��� Maintenance Production

### Sauvegarde Automatique

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.production.yml exec postgres-prod pg_dump -U hrlead_prod hrlead_prod > backup/hrlead_$DATE.sql
```

### Mise à Jour

```bash
# 1. Sauvegarde
./backup.sh

# 2. Pull des nouvelles images
docker-compose -f docker-compose.production.yml pull

# 3. Redéploiement
docker-compose -f docker-compose.production.yml up -d

# 4. Vérification
./deploy_production.sh
```

### Rollback

```bash
# En cas de problème
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --scale auth-service-prod=0
# Restaurer la sauvegarde si nécessaire
```

## ��� Dépannage Production

### Problèmes Courants

1. **Service non accessible** :
   ```bash
   docker-compose -f docker-compose.production.yml logs service-name
   ```

2. **Erreur de base de données** :
   ```bash
   docker-compose -f docker-compose.production.yml exec postgres-prod psql -U hrlead_prod -d hrlead_prod
   ```

3. **Problème de mémoire** :
   ```bash
   docker stats
   # Augmenter les limites dans docker-compose.production.yml
   ```

### Contacts d'Urgence

- **DevOps** : devops@company.com
- **Sécurité** : security@company.com
- **Support** : support@company.com

## ��� Optimisations Production

### Performance

1. **Cache Redis** : Configuration optimale
2. **Connection Pooling** : SQLAlchemy
3. **CDN** : Pour les assets statiques
4. **Compression** : Gzip activé

### Scalabilité

1. **Horizontal Scaling** : Réplicas des services
2. **Load Balancing** : Nginx/HAProxy
3. **Database Sharding** : Si nécessaire
4. **Microservices** : Déjà implémenté

## ✅ Checklist Production

- [ ] Variables d'environnement configurées
- [ ] Certificats SSL installés
- [ ] Base de données sécurisée
- [ ] Firewall configuré
- [ ] Monitoring activé
- [ ] Sauvegardes automatiques
- [ ] Tests de charge effectués
- [ ] Documentation mise à jour
- [ ] Équipe formée
- [ ] Plan de rollback prêt
