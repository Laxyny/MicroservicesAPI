
# MicroservicesAPi - Le Petit Livreur

Ce projet fil rouge pour notre 3e année de Bachelor consiste a reproduire 'Amazon' à l'aide de plusieurs microservices et un front en Angular.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Go](https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)

---

## Table des Matières
1.  [Fonctionnalités](#fonctionnalités)
2.  [Architecture Technique](#architecture-technique)
3.  [Stack Technologique](#stack-technologique)
4.  [Prérequis](#prérequis)
5.  [Installation et Lancement](#installation-et-lancement)
6.  [Détail des Microservices et Endpoints](#détail-des-microservices-et-endpoints)
7.  [Sécurité](#sécurité)
8.  [Déploiement](#déploiement)
9.  [Auteurs](#auteurs)

---

## Fonctionnalités

La plateforme "Le Petit Livreur" offre les fonctionnalités suivantes :

* **Gestion des Utilisateurs :**
    * Création de compte (Client ou Vendeur).
    * Connexion sécurisée par email/mot de passe et via Google (OAuth).
    * Authentification à deux facteurs (2FA) disponible.
    * Gestion de son profil utilisateur.
* **Gestion des Boutiques (pour les Vendeurs) :**
    * Création, modification et suppression de sa propre boutique.
    * Ajout et gestion des produits associés à sa boutique.
* **Catalogue de Produits :**
    * Consultation de tous les produits disponibles.
    * Filtrage des produits par catégorie.
    * Recherche de produits.
    * Consultation des détails d'un produit et des avis clients.
* **Gestion des Commandes et du Panier :**
    * Ajout de produits au panier.
    * Ajout de produits dans sa wishlist pour les consulter ultérieurement.
    * Processus de commande complet avec saisie de l'adresse de livraison.
    * Consultation de l'historique de ses commandes.
* **Avis et Évaluations :**
    * Possibilité pour les clients de noter et de commenter les produits qu'ils ont achetés.
* **Notifications :**
    * Système de notifications en temps réel (via WebSockets) pour les changements de stratut de commande, les nouvelles commandes (vendeus), etc.
* **Rapports (pour les Vendeurs) :**
    * Génération de rapports de ventes manuels ou planifiés (quotidien, hebdomadaire, mensuel).
* **Monitoring :**
    * Une page de statut permettant de visualiser l'état de santé de chaque microservice.

---

## Architecture Technique

Le projet est basé sur une **architecture en microservices**. Chaque service est indépendant, containerisé avec Docker et communique via des requêtes HTTP, orchestré par une API Gateway qui sert de point d'entrée unique.

<p align="center">
  <img src="https://raw.githubusercontent.com/Laxyny/MicroservicesAPI/develop/.github/assets/architecture.png" alt="Architecture MicroservicesAPI" width="700"/>
</p>

---

## Stack Technologique

| Catégorie | Technologie | Rôle |
| --- | --- | --- |
| **Frontend** | Angular | Framework pour l'application web monopage (SPA). |
| **Backend** | Node.js / Express | Majorité des microservices (utilisateurs, produits, etc.). |
| | Python / FastAPI | Microservice de génération de rapports. |
| | Go | Microservice de monitoring de l'état des services. |
| **API Gateway** | Node.js / http-proxy-middleware | Point d'entrée unique et routage des requêtes. |
| **Base de Données** | MongoDB | Base de données NoSQL principale pour la persistance des données. |
| **Stockage Fichiers**| Cloudinary | Stockage et gestion des images (logos, produits). |
| **Conteneurisation** | Docker | Isolation et déploiement des services. |
| **Temps réel** | Socket.IO | Communication WebSocket pour les notifications. |

---

## Prérequis

- Docker et Docker Compose installés.
- Un compte sur Cloudinary pour le stockage des images.
- Un projet sur Google Cloud pour l'authentification OAuth (client ID et secret).

---

## Installation et Lancement

1. **Clonez le dépôt :**
   ```bash
   git clone https://github.com/Laxyny/MicroservicesAPI.git
   ```

2. **Configurez les variables d'environnement :**
   - Créez un fichier `.env` à la racine du projet et ajoutez les variables nécessaires (par exemple, pour MongoDB, Cloudinary, etc.).

3. **Lancez les services avec Docker Compose :**
   ```bash
   docker-compose up --build
   ```
  
4. **Accédez à l'application :**
   - Frontend : [http://localhost:4200](http://localhost:4200)
   - API Gateway : [http://localhost:8081](http://localhost:8081)

---

## Détail des Microservices et Endpoints

| Service | Port | Endpoints Principaux | Description |
| --- | --- | --- | --- |
| **API Gateway** | `8081` | `/` | Point d'entrée unique qui redirige vers les autres services. |
| **Monitoring** | `8080` | `GET /status`, `GET /health` | Vérification de l'état des microservices. |
| **Utilisateurs** | `3000` | `POST /register`, `GET /user`, `PUT /user/updateUser/:id` | Gestion des utilisateurs (création, lecture, mise à jour, suppression). |
| **OAuth** | `5000` | `POST /login`, `POST /logout`, `GET /auth/google` | Gestion de l'authentification (classique et Google). |
| **Magasins** | `3002` | `POST /seller/createStore`, `GET /seller/store/:id` | Gestion des boutiques des vendeurs. |
| **Produits** | `3004` | `POST /product/createProduct`, `GET /product/listProducts` | Gestion des produits. |
| **Commandes** | `3005` | `POST /orders`, `GET /orders` | Gestion des commandes. |
| **Catégories** | `3006` | `GET /category`, `POST /category/createCategory` | Gestion des catégories de produits. |
| **Paniers** | `3007` | `GET /cart`, `POST /cart/add`, `DELETE /cart/remove` | Gestion des paniers utilisateurs. |
| **2FA** | `3008` | `GET /2fa/setup`, `POST /2fa/verify` | Gestion de l'authentification à deux facteurs. |
| **Wishlist** | `3011` | `GET /`, `POST /`, `DELETE /` | Gestion de la wishlist des utilisateurs. |
| **Avis** | `3003` | `POST /rating/create`, `GET /rating/product/:productId` | Gestion des avis et notes. |
| **Rapports** | `7000` | `POST /reports/generate`, `GET /reports/:id` | Génération de rapports PDF. |
| **Notifications**| `8000` | `GET /notifications/:userId` | Envoi de notifications via WebSockets. |

---

## Sécurité

Plusieurs mécanismes ont été mis en place pour sécuriser la plateforme :

-   **Authentification par Token :** Après une connexion réussie, un token personnalisé est généré et stocké dans un cookie `httpOnly`.
-   **Token Personnalisé :** Le token contient des informations de sécurité supplémentaires comme :
    -   `deviceFingerprint`: Une empreinte unique du navigateur client pour lier le token à un appareil.
    -   `proofOfWork`: Un petit défi calculatoire pour complexifier la génération de token et prévenir le spam.
-   **Authentification à deux facteurs (2FA) :** Les utilisateurs peuvent activer une couche de sécurité supplémentaire via une application d'authentification (Google Authenticator, etc.).
-   **Middlewares de Contrôle d'Accès :** Des middlewares (`authMiddleware`, `sellerMiddleware`) protègent les routes en vérifiant la validité du token et le rôle de l'utilisateur.

---

## Déploiement

Le projet peut être déployé sur n'importe quel service supportant Docker. Pour un déploiement local, utilisez Docker Compose comme décrit dans la section Installation et Lancement.

Chaque microservice est doté d'un `Dockerfile` pour créer une image conteneurisée. Le fichier `docker-compose.yml` à la racine permet d'orchestrer le déploiement de l'ensemble des services en environnement de développement ou de production simple.

---

## Auteurs

- [Kevin GREGOIRE](https://www.github.com/Laxyny)
- [Théo MIRANDA](https://www.github.com/Mirandos)
- [Presley OBIANG](https://www.github.com/OBIANG5)