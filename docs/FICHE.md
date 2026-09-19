---
titre: FICHE — YT-resume-extension
projet: YT-resume-extension
role: Extension Chrome : transcription YouTube → résumé IA
stack: [Chrome MV3, React 18, TypeScript, Vite 5, Tailwind 3, youtube-transcript]
ports: { "aucun": "extension navigateur — pas de port ; vite dev sert le popup sur son port par défaut" }
urls: ["Production locale : dist/ chargé en unpacked dans chrome://extensions"]
depots: ["C:\\Bureau\\Dev\\YT-resume-extension", "https://github.com/JFoissac/Youtube-resume-transcript.git"]
services: [Aucun service serveur — extension cliente uniquement]
donnees: "Aucune base : transcription récupérée à la volée ; logs en mémoire (src/logs.ts) consultables via logs.html"
depend_de: [API publique YouTube (transcription via la lib youtube-transcript), chatgpt.com / claude.ai / chat.deepseek.com, presse-papiers du navigateur, dist.pem (clé de signature locale)]
sante: "npm run build puis charger dist/ en unpacked dans chrome://extensions"
tests: "Aucun test automatisé ; npm run lint (ESLint)"
branche_courante: paste-auto
owner: JF
statut: dormant
last_reviewed: 2026-09-19
---

# FICHE — YT-resume-extension

## 1. À quoi ça sert
Extension Chrome qui ajoute un bouton dans l'interface YouTube : en un clic, elle récupère la transcription de la vidéo en cours, la copie dans le presse-papiers et ouvre une IA (ChatGPT, Claude, DeepSeek) pour en obtenir un résumé.
Elle évite de recopier à la main un transcript ou de chercher un service tiers qui envoie la vidéo ailleurs.
Public visé : usage strictement personnel du porteur.

## 2. État actuel
Dernier commit : **2025-02-07** (`feat: test paste top openai` sur la branche `paste-auto`) — soit **~19 mois** au 2026-09-19 : projet **dormant, proche de l'abandon**.
- Marche (au dernier commit) : injection d'un bouton sur les pages `youtube.com/watch`, récupération de la transcription via `youtube-transcript` (langue par défaut `fr`, repli automatique sur une autre langue), copie dans le presse-papiers, redirection vers l'IA choisie, notifications visuelles, page de logs (`logs.html`), popup React.
- En chantier : `src/logs.ts` **modifié non commité** (34 insertions / 34 suppressions — reformatage apparent) ; la branche `paste-auto` n'est **pas fusionnée** dans `develop` ni `main`, où seul le commit initial du 2025-02-02 existe.
- À VENIR : rien. Le connecteur DeepSeek est déclaré dans la config UI (`AI_MODELS.DEEPSEEK`) mais **aucun branchement** correspondant dans `background.ts` (seuls `chat.openai.com` et `claude.ai` y sont traités) → à ne pas présenter comme fonctionnel.
- Implication : **candidat à l'archivage** (voire à la suppression du dépôt) — un an et demi sans mouvement, aucune publication sur le Chrome Web Store identifiée, aucun utilisateur autre que le porteur. Aucune suppression n'est faite ici : décision à prendre par le porteur. Avant archivage, trois choses à trancher : le sort de `dist.pem` versionné, la fusion éventuelle de `paste-auto`, et le `src/logs.ts` non commité.

## 3. Démarrage / arrêt
```bash
cd "C:/Bureau/Dev/YT-resume-extension"
npm install
# build de l'extension → dist/ (reprend public/manifest.json)
npm run build
# chargement : chrome://extensions → mode développeur → « Charger l'extension non empaquetée » → choisir dist/
# développement (popup seul, sans le contexte Chrome — les API chrome.* manquent)
npm run dev
# arrêt : fermer le serveur vite / retirer l'extension de chrome://extensions
# redémarrage d'un service : après tout rebuild, cliquer « Actualiser » sur la carte de l'extension
```
`dist.crx` (paquet signé) et `dist.pem` (clé) sont versionnés dans le dépôt : un `.crx` peut être installé par glisser-déposer sur `chrome://extensions`.

## 4. Architecture
Extension Manifest V3 empaquetée par **Vite** (build multi-entrées) ; l'UI est en React, la logique d'injection en DOM natif.

```
YT-resume-extension/
├── manifest.json            manifest « source » à la racine (permissions réduites, pointe les .tsx) — ⚠️ voir § 6
├── public/
│   ├── manifest.json        manifest réellement empaqueté (permissions complètes, pointe les .js)
│   ├── icon.png
│   └── logs.html            page de consultation des logs
├── index.html               popup (React)
├── src/
│   ├── main.tsx / App.tsx            popup : bouton d'action → chrome.tabs.sendMessage({action:"transcribe"})
│   ├── contentScript.tsx             injecte le bouton sur YouTube (sélecteur des like/dislike)
│   ├── background.ts                 service worker : SEND_TO_AI → presse-papiers + ouverture de l'IA ; buffer de logs
│   ├── background.js                 artefact de build versionné (doublon de background.ts)
│   ├── chatgptInjector.ts            content script côté chat.openai.com (notifications)
│   ├── config/settings.ts            CONFIG : AI_MODELS (ChatGPT/Claude/DeepSeek), SELECTORS, ERRORS, STYLES
│   ├── utils/                        transcriptionManager (youtube-transcript), claudeInjector, logger, errorHandler, urlUtils
│   ├── logs.ts (+ logs.html)         collecte/affichage des logs runtime
│   └── types/models.ts
├── dist.crx / dist.pem      paquets et clé de signature versionnés
└── vite.config.ts           entrées : contentScript, background, chatgptInjector, popup
```
Flux : clic sur le bouton → `contentScript` lit l'URL (`isVideoWatch`), récupère l'ID vidéo → `getTranscription` (lib `youtube-transcript`) → `SEND_TO_AI` vers le service worker → copie presse-papiers + `chrome.tabs.create` vers l'IA choisie (approche « coller puis demander le résumé »).
Permissions : `activeTab`, `scripting`, `clipboardWrite`, `tabs` ; hôtes `*://*.youtube.com/*`, `*://*.chat.openai.com/*`, `*://*.claude.ai/*`, `*://*.deepseek.com/*`.
Aucune base de données, aucun secret d'API (l'utilisateur colle lui-même dans l'IA).

## 5. Données & dépendances externes
- **Aucune base, aucun stockage persistant** : transcription récupérée à la volée, logs gardés en mémoire dans le service worker (100 entrées max).
- API tierce : transcription YouTube via la lib npm `youtube-transcript` (endpoint non officiel : casse si YouTube change son format) ; IA ouvertes en onglet (`chatgpt.com`, `claude.ai`, `chat.deepseek.com`) — pas de clé API, pas d'appel serveur.
- Fichiers sensibles dans le dépôt : `dist.pem` (clé privée de signature, versionnée et poussée sur GitHub) et `dist.crx` (paquet signé correspondant).
- Projet d'origine : initialisé depuis un template **bolt.new** (`.bolt/config.json` = `bolt-vite-react-ts`).
- Chrome Web Store : **aucune trace de publication** dans le dépôt — à confirmer.
- Matériel : aucun (hors navigateur Chrome).

## 6. Points sensibles / pièges connus
- **`dist.pem` (clé privée de signature d'extension) est versionné** dans un dépôt poussé sur GitHub : celui qui l'obtient peut publier une mise à jour signée de la même extension. À retirer du suivi et à considérer comme compromise si le dépôt est public.
- **Deux `manifest.json`** : celui de la racine (permissions réduites, référence `src/contentScript.tsx`) et celui de `public/` (permissions complètes, référence `.js`). C'est **`public/manifest.json`** qui finit dans `dist/` et qui compte ; modifier l'autre n'a aucun effet — piège classique dans ce dépôt.
- **`src/background.js` versionné** à côté de `background.ts` : artefact de build à ne pas éditer (risque de divergence).
- **DeepSeek non câblé** : présent dans `CONFIG.AI_MODELS` et dans les `host_permissions`, mais `background.ts` ne gère que ChatGPT et Claude → l'option ne peut pas aboutir en l'état.
- **Branche courante non fusionnée** : `paste-auto` porte le travail réel, `main`/`develop` sont restées au commit initial ; `origin/HEAD` pointe `develop`.
- **Dépendance à un endpoint YouTube non officiel** : une évolution de YouTube casse silencieusement la récupération de transcription (souvent 1 an et demi plus tard = à retester avant tout usage).
- **Aucun test, aucun lint en CI** : `npm run lint` est manuel.

## 7. Tests & non-régression
```bash
# test rapide (smoke)
npm run build   # puis charger dist/ en unpacked et ouvrir une vidéo YouTube : le bouton apparaît à côté des like/dislike
# tests unitaires / e2e
Aucun test automatisé dans le dépôt.
# contrôle statique
npm run lint    # ESLint
npx tsc --noEmit
```

## 8. Diagnostic express
| Symptôme | Commande | Cause probable |
|---|---|---|
| Aucun bouton sur YouTube | console de la page (`chrome://extensions` → inspecter) | sélecteur `SELECTORS.LIKE_CONTAINER` cassé par une refonte de YouTube |
| « Aucune transcription disponible » | tester une autre vidéo, logs via `logs.html` | sous-titres absents ou endpoint `youtube-transcript` cassé |
| Le bouton ne fait rien | vérifier les permissions du manifest chargé | ancien `dist/` chargé / mauvais manifest (racine vs `public/`) |
| Redirection vers l'IA mais rien de collé | permissions `clipboardWrite` du manifest chargé | copie presse-papiers refusée |
| Option DeepSeek sans effet | `grep -n "deepseek" src/background.ts` | branchement absent (seuls ChatGPT/Claude sont gérés) |
| Modifs de `logs.ts` persistantes | `git -C "C:/Bureau/Dev/YT-resume-extension" status --porcelain` | modifications non commitées jamais tranchées |

## 9. Liens
- Plan en cours : —
- Décisions : `docs/decisions/` (pas encore créé)
- Runbook : `docs/RUNBOOK.md` (pas encore créé)
- Dépôt : https://github.com/JFoissac/Youtube-resume-transcript.git
- Fiche dans le vault : `DevBrain/10-PROJETS/YtResumeExtension/FICHE.md` (jonction sur ce fichier)
