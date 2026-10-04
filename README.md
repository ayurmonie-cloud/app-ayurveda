# Ayurmonie

Application compagnon pour suivre des programmes ayurvédiques, sur iPhone et Android, avec son espace d'administration web.

| Dossier                  | Contenu                                                                  |
| ------------------------ | ------------------------------------------------------------------------ |
| `apps/mobile`            | App Expo (React Native, TypeScript, Expo Router) pour iOS et Android     |
| `apps/admin`             | Admin web Next.js, déployé sur Vercel                                    |
| `packages/core`          | Logique métier partagée et testée : langues, check-in, dosha, régularité |
| `packages/i18n`          | Traductions de l'interface (français, anglais, espagnol)                 |
| `packages/supabase`      | Types TypeScript générés depuis le schéma de la base                     |
| `packages/tsconfig`      | Configuration TypeScript commune                                         |
| `packages/eslint-config` | Configuration ESLint des paquets sans interface                          |
| `supabase`               | Migrations SQL, règles de sécurité (RLS), tests pgTAP, données de démo   |

Le document d'architecture et de fonctionnalités décrit les choix techniques et le plan par étapes. La mise en place des comptes externes est détaillée dans [docs/setup.md](docs/setup.md), et les conventions de code dans [docs/conventions.md](docs/conventions.md).

## Démarrer en local

Prérequis : Node 22, pnpm 10 (`corepack enable`), Docker (pour Supabase en local).

```bash
pnpm install
pnpm db:start          # lance Supabase en local et applique migrations + données de démo
cp apps/mobile/.env.example apps/mobile/.env.local   # puis colle la clé « publishable » affichée
cp apps/admin/.env.example apps/admin/.env.local
pnpm dev:mobile        # app : scanne le QR code avec Expo Go
pnpm dev:admin         # admin : http://localhost:3000
```

## Commandes utiles

| Commande         | Rôle                                                     |
| ---------------- | -------------------------------------------------------- |
| `pnpm lint`      | ESLint sur tout le monorepo                              |
| `pnpm typecheck` | Vérification TypeScript                                  |
| `pnpm test`      | Tests unitaires (Vitest)                                 |
| `pnpm db:test`   | Tests de la base : sécurité RLS et règles métier (pgTAP) |
| `pnpm db:reset`  | Réapplique toutes les migrations sur la base locale      |
| `pnpm db:types`  | Régénère les types TypeScript après une migration        |
| `pnpm format`    | Formate le code avec Prettier                            |

La CI GitHub exécute tout cela à chaque pull request.
