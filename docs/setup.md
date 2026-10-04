# Comptes et clés à créer

Le code ne contient aucun secret : chaque clé se déclare en variable d'environnement. Voici ce qu'il faut créer, dans l'ordre où on en aura besoin.

## Maintenant : socle

### 1. Supabase (base de données, comptes, fichiers)

1. Créer un projet sur [supabase.com](https://supabase.com), **région Europe** (par exemple Paris `eu-west-3` ou Francfort `eu-central-1`) : les données de suivi sont des données de santé au sens du RGPD.
2. Dans **Project Settings > API Keys**, récupérer l'URL du projet et la clé **publishable** (`sb_publishable_…`). La clé **secret** ne doit jamais aller dans l'app ni dans l'admin.
3. Appliquer le schéma : `pnpm supabase link --project-ref <ref>` puis `pnpm supabase db push`.
4. Dans **Authentication > URL Configuration**, ajouter les URL de redirection : `ayurmonie://**` (app) et l'URL de l'admin sur Vercel.
5. Dans **Authentication > Sign In / Providers > Email**, garder la confirmation d'email activée et un mot de passe de 8 caractères minimum.
6. Créer ton compte depuis l'app (ou l'onglet **Authentication > Users**), puis te donner le rôle admin dans l'éditeur SQL :

   ```sql
   update public.profiles set role = 'admin' where email = 'ton-email@exemple.fr';
   ```

### 2. Expo / EAS (builds iOS et Android)

1. Créer un compte sur [expo.dev](https://expo.dev), puis lancer `npx eas-cli@latest init` dans `apps/mobile` : cela crée le projet EAS et donne son identifiant (`EAS_PROJECT_ID`).
2. Déclarer `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` dans **expo.dev > Project > Environment variables**, pour les environnements `development`, `preview` et `production`.
3. Les identifiants de l'app sont provisoirement `com.ayurmonie.app` (iOS et Android) dans `apps/mobile/app.config.ts`. Ils deviennent définitifs à la première publication : à confirmer avec le nom de l'app.

### 3. Vercel (admin)

1. Importer le dépôt GitHub dans Vercel avec **Root Directory** = `apps/admin` (Vercel détecte pnpm et le monorepo).
2. Déclarer `NEXT_PUBLIC_SUPABASE_URL` et `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
3. Choisir une région européenne pour les fonctions (`fra1` ou `cdg1`).

## Plus tard : ventes, consultations et IA

| Service             | Quand                    | À fournir                                                                     |
| ------------------- | ------------------------ | ----------------------------------------------------------------------------- |
| Apple Developer     | Avant la bêta TestFlight | Compte (99 $/an), idéalement au nom de l'entreprise                           |
| Google Play Console | Avant la bêta Android    | Compte (25 $ une fois)                                                        |
| RevenueCat          | Étape « Ventes »         | Projet relié aux deux stores, clés publiques iOS/Android, secret de webhook   |
| Stripe              | Étape « Ventes »         | Secret de webhook pour les ventes du site ayurmonie (déjà en place côté site) |
| cal.eu              | Étape « Ventes »         | Secret de webhook des réservations                                            |
| Fournisseur d'IA    | Étape « IA »             | Clé d'API, stockée uniquement dans les secrets des fonctions Supabase         |
