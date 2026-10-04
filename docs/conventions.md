# Conventions

## Organisation

- **Monorepo pnpm + Turborepo.** Les apps (`apps/*`) dépendent des paquets (`packages/*`), jamais l'inverse. Les paquets sont publiés en TypeScript source et transpilés par l'app qui les utilise.
- **La logique métier va dans `packages/core`**, sans dépendance à React ni à Supabase, et chaque fonction y est testée avec Vitest. Les écrans restent fins.
- **App mobile** : les routes vivent dans `apps/mobile/src/app` (Expo Router) ; le reste est rangé par fonctionnalité dans `src/features/<domaine>`, les briques d'interface dans `src/components/ui`. On ajoute une dépendance native avec `npx expo install`, pour garder des versions compatibles avec le SDK.
- **Admin** : Next.js App Router, Server Components par défaut, Server Actions pour les écritures. Le client Supabase serveur utilise la session de l'admin, jamais la clé secrète.

## Base de données

- Toute évolution passe par une **migration** dans `supabase/migrations` (`pnpm supabase migration new <nom>`), jamais par l'interface de Supabase.
- **Chaque table a la RLS activée** et des droits accordés explicitement (`grant`) : Supabase ne donne plus rien par défaut dans ce projet (voir la première migration). Un test pgTAP vérifie qu'aucune table n'est oubliée.
- Les fonctions `security definer` fixent `search_path = ''` et qualifient tous les noms. Les politiques appellent `(select auth.uid())` pour être évaluées une seule fois.
- Les textes affichés aux utilisateurs sont des `localized_text` (`{"fr": …, "en": …, "es": …}`, français obligatoire).
- Les données de santé (check-ins, carnet, photos) exigent le consentement `health_tracking` ; l'admin ne les lit que si le client a consenti à `journal_sharing`.
- `entitlements` est la seule source de vérité des accès. Elle n'est écrite que par les webhooks (rôle `service_role`) ou par l'admin.
- Après une migration : `pnpm db:test`, puis `pnpm db:types` pour mettre à jour les types. La CI échoue si les types sont obsolètes.

## Traductions

- Aucun texte en dur dans l'app : tout passe par `t('…')`, avec des clés typées.
- Le français (`packages/i18n/src/locales/fr.json`) fait référence ; un test vérifie que l'anglais et l'espagnol ont exactement les mêmes clés et variables.

## Qualité

- TypeScript strict partout, ESLint sans avertissement, Prettier pour le formatage.
- Avant de pousser : `pnpm lint && pnpm typecheck && pnpm test`, plus `pnpm db:test` si la base change.
- Une pull request par étape ou fonctionnalité, avec la CI au vert avant la fusion.
