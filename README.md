# FluentFlow 🌊

Apprendre l'anglais en discutant — **application web** (site 100 % statique, aucune donnée envoyée à un serveur : tes réglages et ta progression restent dans ton navigateur).

## Fonctionnalités

- 💬 **Tuteur IA conversationnel** : réponses en streaming, scénarios (vie quotidienne, voyage, travail, « Raconte ta journée » en mode écoute), conversation libre
- ✅ **Corrections grammaticales** catégorisées (articles, prépositions, temps, orthographe, ordre des mots) — **fusionnées dans un seul appel LLM** (économie de quota)
- 🎤🔊 **Voix** : saisie vocale (Web Speech API) + lecture à voix haute avec **voix naturelles** au choix (Edge/Chrome)
- 🗣 **Prononciation** : écouter → répéter → score de similarité mot à mot
- 🎯 **Exercices ciblés** : priorisés selon tes erreurs les plus fréquentes
- 📚 **Leçons hors-ligne** embarquées
- 🏅 **Progression** : badges + statistiques par type d'erreur
- 💾 **Sessions** : tes conversations sont sauvegardées localement et reprenables

Fournisseurs IA supportés : **OpenAI, OpenRouter, Gemini, Groq, Ollama (local)** — clé stockée uniquement dans ton navigateur.

## Développement

```bash
npm ci
npm run dev      # serveur de dev
npm test         # tests (vitest)
npm run build    # build statique -> dist/
```

## Déploiement

Le site est en ligne sur **https://conversation-nine-beta.vercel.app/** — déployé automatiquement par Vercel à chaque push sur `main` (le workflow CI valide tests + build avant).
