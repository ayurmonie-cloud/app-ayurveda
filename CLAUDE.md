# Instructions pour les agents

Lire [docs/conventions.md](docs/conventions.md) avant toute modification : organisation du monorepo, règles de la base (RLS, migrations, consentements) et traductions.

- Gestionnaire de paquets : pnpm (jamais npm ni yarn). Dépendances Expo : `npx expo install` dans `apps/mobile`.
- Expo change à chaque SDK : vérifier l'API dans la documentation de la version installée (`expo` dans `apps/mobile/package.json`) plutôt que de mémoire.
- Vérifications avant de pousser : `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test`, plus `pnpm db:test` et `pnpm db:types` si une migration change.
- Les échanges avec la propriétaire du projet se font en français.
