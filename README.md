# FluentFlow 🌊

Apprendre l'anglais en discutant — **application web** (site 100 % statique, aucune donnée envoyée à un serveur : tes réglages et ta progression restent dans ton navigateur).

## Fonctionnalités

- 💬 **Tuteur IA conversationnel** : réponses en streaming, scénarios (vie quotidienne, voyage, travail, « Raconte ta journée » en mode écoute), conversation libre
- ✅ **Corrections grammaticales** catégorisées (articles, prépositions, temps, orthographe, ordre des mots) — **fusionnées dans un seul appel LLM** (économie de quota)
- 🎤🔊 **Voix** : saisie vocale (Web Speech API) + lecture à voix haute avec **voix naturelles** au choix (Edge/Chrome)
- 🗣 **Prononciation** : écouter → répéter → score de similarité mot à mot
- 🎯 **Exercices ciblés générés par l'IA** : adaptés à ton niveau et priorisés selon tes erreurs les plus fréquentes (repli automatique sur une banque hors-ligne intégrée)
- 📚 **Leçons hors-ligne** embarquées
- 🏅 **Progression** : badges + statistiques par type d'erreur
- 💾 **Sessions** : tes conversations sont sauvegardées localement et reprenables

Fournisseurs IA supportés : **IA intégrée (dans ton navigateur, sans clé — Gemini Nano ou modèle WebGPU)**, OpenAI, OpenRouter, Gemini, Groq, **Cerebras**, Ollama (local) — clé éventuelle stockée uniquement dans ton navigateur.

**Bascule automatique** : ajoute des clés de secours (Paramètres → Bascule automatique) et si ton fournisseur principal atteint sa limite (Gemini free tier, quotas…), FluentFlow réessaie tout seul sur Groq → Cerebras → OpenRouter → … tant qu'aucun mot n'a encore été affiché. Option « IA intégrée » en tout dernier recours.

## Développement

```bash
npm ci
npm run dev      # serveur de dev
npm test         # tests (vitest)
npm run build    # build statique -> dist/
```

## Déploiement

Le site est en ligne sur **https://conversation-nine-beta.vercel.app/** — déployé automatiquement par Vercel à chaque push sur `main` (le workflow CI valide tests + build avant).
