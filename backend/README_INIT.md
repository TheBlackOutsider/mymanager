# 🚀 Initialisation des Données de Base - HRlead

Ce document explique comment initialiser et gérer les données de base du système HRlead.

## 📋 **Données Initialisées**

### **1. Employés de Base**
- **Admin HR** (`admin.hr@company.com`) - Rôle: `hr_head`
- **Manager IT** (`manager.it@company.com`) - Rôle: `manager`
- **Employee Dev** (`dev@company.com`) - Rôle: `employee`
- **HR Officer** (`hr.officer@company.com`) - Rôle: `hr_officer`

**Mot de passe par défaut:** `password123`

### **2. Événements de Base**
- **Formation Sécurité IT** - Type: `training`
- **Onboarding Nouveaux Employés** - Type: `onboarding`

### **3. Logs d'Audit**
- Log d'initialisation du système

## 🔐 **Système de Permissions**

### **Rôles et Permissions**

#### **Employee (Employé)**
- ✅ Lire ses informations
- ✅ Lire les événements
- ✅ Créer/modifier ses demandes de congés
- ✅ Voir les rapports
- ✅ Lire les notifications
- ✅ Voir les paramètres

#### **Manager (Chef d'équipe)**
- ✅ Toutes les permissions Employee
- ✅ Voir/modifier les informations de son équipe
- ✅ Créer/gérer les événements
- ✅ Approuver/rejeter les congés
- ✅ Générer/exporter des rapports
- ✅ Envoyer/gérer les notifications
- ✅ Modifier les paramètres
- ✅ Voir les logs d'audit

#### **HR Officer (Chargé RH)**
- ✅ Toutes les permissions Manager
- ✅ Créer/modifier/supprimer des employés
- ✅ Supprimer des demandes de congés
- ✅ Planifier des rapports automatiques
- ✅ Configurer les notifications
- ✅ Exporter les logs d'audit

#### **HR Head (Directeur RH)**
- ✅ Toutes les permissions HR Officer
- ✅ Supprimer des employés
- ✅ Accéder aux paramètres système
- ✅ Configurer l'audit

## 🛠️ **Scripts Disponibles**

### **1. Initialisation des Données**
```bash
cd backend
python init_base_data.py
```

**Fonctionnalités:**
- Création des employés de base
- Création des événements de base
- Création des logs d'audit
- Vérification des données existantes

### **2. Gestion des Permissions**
```bash
cd backend
python manage_permissions.py
```

**Fonctionnalités:**
- Visualisation des permissions par rôle
- Matrice des permissions
- Ajout/suppression de permissions
- Vérification des permissions

### **3. Test des Données**
```bash
cd backend
python test_data.py
```

**Fonctionnalités:**
- Vérification de la cohérence des données
- Test des relations entre entités
- Validation des permissions
- Résumé des données présentes

## 🔧 **Utilisation**

### **Première Initialisation**
1. Assurez-vous que la base de données PostgreSQL est active
2. Vérifiez la configuration dans `config.py`
3. Lancez le script d'initialisation:
   ```bash
   python init_base_data.py
   ```

### **Gestion des Permissions**
1. Lancez le gestionnaire de permissions:
   ```bash
   python manage_permissions.py
   ```
2. Utilisez le menu interactif pour:
   - Voir toutes les permissions
   - Vérifier les permissions par rôle
   - Modifier les permissions

### **Vérification des Données**
1. Lancez le script de test:
   ```bash
   python test_data.py
   ```
2. Vérifiez que toutes les données sont présentes

## 📊 **Structure des Données**

### **Tables Principales**
- `employees` - Employés et utilisateurs
- `events` - Événements RH
- `leave_requests` - Demandes de congés
- `notifications` - Notifications système
- `security_audit_logs` - Logs d'audit

### **Relations**
- Un employé peut avoir plusieurs demandes de congés
- Un employé peut participer à plusieurs événements
- Un employé peut recevoir plusieurs notifications
- Toutes les actions sont loggées dans l'audit

## 🚨 **Sécurité**

### **Authentification**
- Mots de passe hashés avec bcrypt
- Support 2FA (si activé)
- Tokens JWT avec expiration
- Refresh tokens sécurisés

### **Audit**
- Logs de toutes les actions sensibles
- Traçabilité des modifications
- Niveaux de sévérité configurables
- Export des logs d'audit

### **Permissions**
- Vérification systématique des permissions
- Principe du moindre privilège
- Séparation des rôles claire
- Permissions granulaires par ressource

## 🔄 **Maintenance**

### **Mise à Jour des Données**
- Les scripts vérifient les données existantes
- Pas de duplication lors des ré-exécutions
- Possibilité de modifier les données de base

### **Sauvegarde**
- Sauvegardez la base avant modifications
- Exportez les données critiques
- Testez les scripts en environnement de développement

## 📞 **Support**

En cas de problème:
1. Vérifiez les logs d'erreur
2. Testez la connexion à la base
3. Vérifiez la configuration
4. Consultez les logs d'audit

---

**Version:** 1.0.0  
**Dernière mise à jour:** $(date)  
**Auteur:** Système HRlead 