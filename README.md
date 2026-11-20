# Yoga Studio

Application full-stack de gestion d'un studio de yoga : planification des sessions, consultation des professeurs, inscription des utilisateurs aux sessions.

- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancer l'application](#lancer-lapplication)
- [Tests](#tests)
- [Rapports de couverture](#rapports-de-couverture)
- [Référence](#référence)
- [Dépannage](#dépannage)

## Stack technique

| Partie | Technologies |
|---|---|
| Backend | Node.js 22, Express 4, TypeScript (strict), Prisma 5, PostgreSQL 16, Zod, JWT, bcrypt |
| Frontend | React 19 (hooks), TypeScript (strict), Vite 7, TanStack Query 5, React Router 6, TailwindCSS 4, Axios |
| Tests | Vitest 5 + `@vitest/coverage-v8`, Testing Library, Playwright + `monocart-coverage-reports` |
| Infra | Docker Compose (une base de dev, une base pour les tests backend, une base pour les E2E) |

## Prérequis

- Node.js 22 LTS ou plus récent
- npm
- Docker et Docker Compose

## Installation

### 1. Cloner le dépôt et installer les dépendances

```bash
git clone <url-du-depot>
cd DFSJS-Testez-et-am-liorez-une-application-full-stack-JavaScript

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configurer les variables d'environnement

```bash
cd backend
cp .env.example .env
```

```env
DATABASE_URL="postgresql://yogauser:yogapass@localhost:5445/yogastudio"
JWT_SECRET="your-secret-key-change-me-in-production"
PORT=3006
NODE_ENV=development
```

Le port `3006` n'est pas arbitraire : le proxy de Vite (`frontend/vite.config.ts`) redirige `/api` vers `http://localhost:3006`.

### 3. Démarrer PostgreSQL

Depuis la racine du projet :

```bash
docker compose up -d
```

Trois conteneurs sont lancés, un par usage, pour que les tests ne touchent jamais aux données de dev :

| Conteneur | Port | Base | Usage |
|---|---|---|---|
| `yoga-studio-db` | 5445 | `yogastudio` | développement (données persistées dans un volume) |
| `yoga-studio-db-test` | 5446 | `yogastudio_test` | tests backend (en mémoire, recréée à chaque lancement) |
| `yoga-studio-db-e2e` | 5447 | `yogastudio_e2e` | tests E2E (en mémoire, recréée et seedée à chaque lancement) |

### 4. Créer le schéma et insérer les données de démo

```bash
cd backend
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Le dossier `prisma/migrations/` est ignoré par git : la première migration est générée en local à partir de `schema.prisma`.

Le seed crée :

- un administrateur : `yoga@studio.com` / `test!1234`
- un utilisateur : `user@test.com` / `test!1234`
- 3 professeurs et 4 sessions

## Lancer l'application

Dans deux terminaux :

```bash
# Terminal 1 : API sur http://localhost:3006
cd backend
npm run dev
```

```bash
# Terminal 2 : interface sur http://localhost:3000
cd frontend
npm run dev
```

Ouvrir http://localhost:3000 et se connecter avec l'un des comptes du seed.

## Tests

| Partie | Type | Outil | Emplacement | Nombre |
|---|---|---|---|---|
| Backend | Unitaires (services, repositories mockés) | Vitest | `backend/tests/unit/` | 4 fichiers |
| Backend | Intégration (routes HTTP + vraie base PostgreSQL) | Vitest + `fetch` | `backend/tests/integration/` | 4 fichiers |
| Frontend | Unitaires (services, hooks, composants) | Vitest + Testing Library | `frontend/src/**/*.test.ts(x)` | 14 fichiers au total |
| Frontend | Intégration (pages rendues avec routeur et React Query, API mockée) | Vitest + Testing Library | `frontend/src/pages/*.test.tsx` | (inclus ci-dessus) |
| Frontend | End-to-end (navigateur réel, vraie API) | Playwright | `frontend/e2e/` | 6 fichiers |

### Tests backend (unitaires + intégration)

Les tests backend utilisent la base de test sur le port 5446. Elle doit être démarrée :

```bash
docker compose up -d postgres-test
```

Puis :

```bash
cd backend
npm test                # mode watch
npx vitest run          # une seule exécution
npx vitest run tests/unit         # uniquement les tests unitaires
npx vitest run tests/integration  # uniquement les tests d'intégration
```

Fonctionnement :

- `tests/global-setup.ts` recrée le schéma sur `yogastudio_test` avant chaque lancement (`prisma db push --force-reset`) ;
- `DATABASE_URL` et `JWT_SECRET` sont forcés dans `vitest.config.mts`, le fichier `.env` n'est donc jamais utilisé par les tests ;
- les tests d'intégration démarrent l'app Express sur un port libre et vident les tables avant chaque test ;
- les fichiers s'exécutent l'un après l'autre (`fileParallelism: false`) car ils partagent la même base.

### Tests frontend (unitaires + intégration)

Aucune dépendance externe : l'API est mockée et le DOM est simulé par jsdom.

```bash
cd frontend
npm test                # mode watch
npx vitest run          # une seule exécution
```

### Tests end-to-end

Les tests E2E pilotent Chromium contre la vraie application. Avant le premier lancement, installer le navigateur :

```bash
cd frontend
npx playwright install chromium
```

Les E2E utilisent leur propre base, sur le port 5447. Elle doit être démarrée :

```bash
docker compose up -d postgres-e2e
```

Puis :

```bash
cd frontend
npm run e2e
```

À chaque lancement :

1. `e2e/global-setup.ts` recrée le schéma de `yogastudio_e2e` et exécute le seed : les tests partent toujours du même état (comptes du seed, professeur d'id `1`) ;
2. Playwright démarre une API dédiée sur le port **3106** (branchée sur la base E2E) et un Vite dédié sur le port **3100** (dont le proxy `/api` pointe vers cette API) ;
3. les serveurs de dev (3000 / 3006) ne sont jamais réutilisés : on peut lancer les E2E pendant que l'application tourne, sans risque d'écrire dans la base de dev.

Les ports et l'URL de la base E2E sont définis dans `frontend/e2e/environment.ts`.

Commandes utiles :

```bash
npx playwright test e2e/login.spec.ts   # un seul fichier
npx playwright test --ui                # mode interactif
npx playwright show-report              # rapport HTML du dernier lancement
```

## Rapports de couverture

Chaque partie impose un seuil minimal de **80 %** sur les quatre indicateurs (instructions, branches, fonctions, lignes). Si un seuil n'est pas atteint, la commande échoue.

| Partie | Commande | Rapport HTML | LCOV |
|---|---|---|---|
| Backend | `cd backend && npm run test:coverage` | `backend/coverage/index.html` | `backend/coverage/lcov.info` |
| Frontend (unitaires + intégration) | `cd frontend && npm run test:coverage` | `frontend/coverage/unit/index.html` | `frontend/coverage/unit/lcov.info` |
| Frontend (E2E) | `cd frontend && npm run e2e` | `frontend/coverage/e2e/index.html` | `frontend/coverage/e2e/lcov.info` |

Un résumé s'affiche aussi dans le terminal à la fin de chaque commande.

Configuration :

- **Backend** : `backend/vitest.config.mts`, provider v8, couvre `src/**/*.ts` sauf `src/dto/` et `src/types/` (schémas Zod et types sans logique).
- **Frontend unitaires** : `frontend/vite.config.ts`, provider v8, couvre `src/**/*.{ts,tsx}` sauf `main.tsx`, `src/types/` et `vite-env.d.ts`.
- **Frontend E2E** : `frontend/e2e/coverage.ts`. La couverture JS est collectée par Playwright dans Chromium à chaque test (`e2e/fixtures.ts`), fusionnée par monocart puis comparée au seuil dans `e2e/global-teardown.ts`. Elle couvre les fichiers `.ts`/`.tsx` de `src/` sauf `main.tsx`.

### Résultats actuels

| Partie | Instructions | Branches | Fonctions | Lignes | Tests |
|---|---|---|---|---|---|
| Backend | 93,38 % | 82,35 % | 94,00 % | 92,85 % | 63 |
| Frontend unitaires + intégration | 97,81 % | 89,00 % | 95,00 % | 97,77 % | 50 |
| Frontend E2E | 95,31 % | 80,61 % | 85,06 % | 92,83 % | 17 |

## Référence

### Scripts npm

Backend (`backend/`) :

| Script | Rôle |
|---|---|
| `npm run dev` | API en mode watch (tsx) |
| `npm run build` / `npm start` | Compilation TypeScript puis lancement de `dist/app.js` |
| `npm run prisma:generate` | Génère le client Prisma |
| `npm run prisma:migrate` | Applique / crée les migrations |
| `npm run prisma:seed` | Insère les données de démo |
| `npm run prisma:studio` | Ouvre Prisma Studio |
| `npm test` | Tests Vitest en mode watch |
| `npm run test:coverage` | Tests + couverture |

Frontend (`frontend/`) :

| Script | Rôle |
|---|---|
| `npm run dev` | Serveur Vite sur le port 3000 |
| `npm run build` / `npm run preview` | Build de production et prévisualisation |
| `npm run lint` | Lint avec oxlint |
| `npm test` | Tests Vitest en mode watch |
| `npm run test:coverage` | Tests + couverture |
| `npm run e2e` | Tests Playwright + couverture E2E |

### Endpoints de l'API

Toutes les routes sauf `/api/auth/*` et `/api/health` demandent un header `Authorization: Bearer <token>`.

| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Crée un compte, renvoie l'utilisateur et son token |
| POST | `/api/auth/login` | Connexion, renvoie l'utilisateur et son token |
| GET | `/api/session` | Liste des sessions |
| GET | `/api/session/:id` | Détail d'une session |
| POST | `/api/session` | Crée une session (admin) |
| PUT | `/api/session/:id` | Modifie une session (admin) |
| DELETE | `/api/session/:id` | Supprime une session (admin) |
| POST | `/api/session/:id/participate/:userId` | Inscrit l'utilisateur à la session |
| DELETE | `/api/session/:id/participate/:userId` | Désinscrit l'utilisateur |
| GET | `/api/teacher` | Liste des professeurs |
| GET | `/api/teacher/:id` | Détail d'un professeur |
| GET | `/api/user/:id` | Profil d'un utilisateur |
| DELETE | `/api/user/:id` | Supprime le compte |
| GET | `/api/health` | Vérifie que l'API répond |

### Structure du projet

```
.
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # schéma de la base
│   │   └── seed.ts            # données de démo
│   ├── src/
│   │   ├── controllers/       # handlers HTTP
│   │   ├── service/           # logique métier
│   │   ├── repository/        # accès aux données (Prisma)
│   │   ├── middleware/        # auth, validation, async
│   │   ├── dto/               # schémas Zod
│   │   ├── routes/            # déclaration des routes
│   │   ├── utils/             # JWT, erreurs HTTP
│   │   └── app.ts
│   ├── tests/
│   │   ├── unit/              # tests des services
│   │   ├── integration/       # tests des routes avec base réelle
│   │   └── global-setup.ts
│   └── vitest.config.mts
├── frontend/
│   ├── src/
│   │   ├── pages/             # pages + leurs tests d'intégration
│   │   ├── components/
│   │   ├── hooks/             # hooks TanStack Query
│   │   ├── services/          # client Axios, auth
│   │   └── types/
│   ├── tests/                 # setup Vitest et helpers de rendu
│   ├── e2e/                   # specs Playwright, fixtures, couverture E2E
│   ├── playwright.config.ts
│   └── vite.config.ts
└── docker-compose.yml
```

## Dépannage

**Les tests backend échouent avec `Can't reach database server at localhost:5446`**
Le conteneur de test n'est pas démarré : `docker compose up -d postgres-test`.

**Les tests E2E échouent avec `Can't reach database server at localhost:5447`**
Le conteneur E2E n'est pas démarré : `docker compose up -d postgres-e2e`.

**Les tests E2E échouent avec `http://localhost:3100 is already used`**
Un Vite ou une API E2E d'une exécution précédente tourne encore (ports 3100 / 3106) : arrêter le processus puis relancer.

**Impossible de se connecter avec les comptes de démo en dev**
La base de dev n'est pas seedée : `cd backend && npm run prisma:seed`.

**Le frontend affiche des erreurs réseau sur `/api`**
L'API doit écouter sur le port 3006 (`PORT=3006` dans `backend/.env`).

**Port déjà utilisé**

```bash
# Linux / macOS
lsof -i :3006
# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3006 | Select-Object OwningProcess
```

**Repartir d'une base propre** (supprime toutes les données de dev)

```bash
cd backend
npx prisma migrate reset
```
