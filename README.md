# Chispa 🦎

Application d'apprentissage des langues multilingue, avec un Espace École (à venir).

## Lancer l'app (débutant)

1. Installer **Node.js** (version LTS) : https://nodejs.org
2. Installer **Expo Go** sur votre téléphone (App Store / Google Play).
3. Dans un terminal, à la racine du projet :
   - `npm install` : télécharge toutes les bibliothèques (une seule fois).
   - `npx expo start` : démarre l'app et affiche un **QR code**.
4. Scannez le QR code (appareil photo sur iPhone, app Expo Go sur Android).
   Le téléphone et l'ordinateur doivent être sur le même Wi-Fi.
   Si ça ne marche pas : `npx expo start --tunnel`.

## Autres commandes

- `npm test` : lance les tests automatiques.
- `npm run typecheck` : vérifie les types TypeScript.
- `npm run lint` : repère les erreurs de style.
