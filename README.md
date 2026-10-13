# Chispa 🦎

Application d'apprentissage des langues multilingue, avec un Espace École (à venir).

## Lancer l'app (débutant)

1. Installer **Node.js** (version LTS) : https://nodejs.org
2. Installer **Expo Go** sur votre téléphone (App Store / Google Play).
3. Dans un terminal, à la racine du projet :
   - `npm install` : télécharge toutes les bibliothèques (une seule fois).
   - `npm start` : prépare le contenu et affiche un **QR code**.
4. Scannez le QR code (appareil photo sur iPhone, app Expo Go sur Android).
   Le téléphone et l'ordinateur doivent être sur le même Wi-Fi.
   Si ça ne marche pas : `npx expo start --tunnel`.

## Commandes utiles

| Commande | Ce qu'elle fait |
|---|---|
| `npm start` | Démarre l'app (et régénère l'index du contenu) |
| `npm test` | Lance tous les tests automatiques |
| `npm run validate:content` | Vérifie tous les fichiers JSON de contenu |
| `npm run typecheck` | Vérifie les types TypeScript |
| `npm run lint` | Repère les erreurs de style et de code |
| `npm run check` | Tout ce qui précède, d'un coup |
| `npm run sounds:generate` | Recrée les effets sonores (`assets/sounds/`) à partir de `src/audio/synth.ts` |

## Organisation du code

- `src/app/` : les **écrans** (Expo Router : un fichier = un écran).
- `src/engine/` : le **moteur** commun à toutes les langues (XP, cœurs, leçons, chemin, validation du contenu).
- `src/languages/` : les **plugins de langue** (règles de correction, accents).
- `src/i18n/` : les **traductions de l'interface** (`locales/fr.json`, `locales/en.json`).
- `src/store/` : la **mémoire** de l'app (réglages et progression, sauvegardés sur le téléphone).
- `src/ui/` : le **design** (couleurs, boutons, composants, exercices, animations).
- `src/audio/` : les **effets sonores** (synthétisés dans le code, réglables dans Réglages).
- `content/<langue>/` : le **contenu** d'une langue (config, unités, astuces, personnages).

## Ajouter une langue

1. Créer le dossier `content/<code>/` avec `config.json`, `units/`, `tips/` et `characters.json`.
2. Lancer `npm run validate:content` : il indique précisément ce qui manque ou ce qui est mal écrit.
3. Le moteur ne change pas. Seule une langue avec des règles particulières (ex. le chinois) demandera un fichier dans `src/languages/`.

## Où en est le projet

- Phase 1 : chemin, leçons, 3 types d'exercices, cœurs, XP, combo, résultats, onboarding, réglages (langue d'interface, thème, sons), unité 1 d'espagnol.
- Ajout : effets sonores et animations (boutons, mascotte, progression, résultats).
