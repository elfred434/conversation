# FluentFlow — Design « Slow Motion »
### Audit → Direction artistique « Slow Flow » → Prompts Google Stitch

> Rôle : designer spécialisé motion/slow design.
> Objectif : transformer FluentFlow en une expérience « slow motion » — lente, fluide, océanique —
> puis fournir les prompts prêts à coller dans **Google Stitch** (stitch.withgoogle.com) pour générer le design.

---

## 1. Audit du design actuel

### 1.1 Ce qui existe déjà (et qu'on garde)

| Élément | État actuel | Verdict slow motion |
|---|---|---|
| Fond navy `#0B1229` + halos radiaux bleu/cyan (8–12 %) | `styles.css` `body` | ✅ Déjà « eau profonde » — à amplifier et **animer très lentement** |
| Dégradé signature `#2563EB → #22D3EE` (135°) | boutons, chips actifs, barres | ✅ Parfait, à réserver aux moments clés (raréfier = plus lent visuellement) |
| Monocolonne 780 px, cartes `#131D3A` radius 14 | toutes les vues | ✅ Rythme de lecture calme — à aérer (+30 % d'espacement vertical) |
| Marque 🌊 vague-bulle sur navy | header + favicon | ✅ **Le motif rêvé du slow design** : la vague est du slow motion à l'état pur |
| Verre dépoli naissant | aucun (cards opaques) | ⚠️ À créer : glassmorphism douce = profondeur « sous l'eau » |

### 1.2 Inventaire du mouvement actuel (quasi nul)

| Animation | Durée actuelle | Problème |
|---|---|---|
| Hover cartes | `0.15s` | Brutale, aucun glissement — « snap » |
| Pulse du micro | `1.2s` | Rythme cardiaque = urgence, l'opposé du slow |
| Typing `…` | blink `1s` | OK mais plat : trois points qui montent comme des bulles seraient narratifs |
| Barre de progression | `0.3s` width | Sensation de sprint ; le slow demande 900 ms+ en ease-out long |
| Transitions d'écran | **aucune** | Les vues apparaissent instantanément (cut sec) |
| Entrée des messages | **aucune** | Les bulles « pop » sans anticipation ni retombée |

**Diagnostic :** l'interface est *visuellement calme* mais *cinétiquement muette*. Le slow motion design
ne consiste pas à ajouter des animations partout — c'est ajouter **de la durée** là où il y a du sens :
entrées, transitions d'état, révélation du contenu, mouvement d'ambiance.

---

## 2. Les 7 principes du slow motion design appliqués à FluentFlow

1. **Tout arrive doucement.** Aucun élément n'apparaît d'un coup : fondu + translation 12 px +
   léger blur (4 px → 0), 450–700 ms, easing `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out doux).
2. **Un seul protagoniste à la fois.** Révélation séquentielle : chaque carte/message suit le précédent
   de 70–90 ms (stagger). L'œil est guidé, jamais assailli.
3. **Mouvement d'ambiance permanent mais géant de durée.** L'aurora du fond dérive sur **40–60 s**,
   la ligne de vague ondule sur **20 s**, deux orbes flottent en 30 s. Visible en périphérie only,
   jamais au premier plan.
4. **Anticipation puis retombée.** Toute micro-interaction monte vite (100 ms) puis se pose lentement
   (400 ms ease-out) — comme une bulle qui remonte et éclate en douceur.
5. **Le flux raconte l'état.** Streaming du tuteur = révélation mot à mot (sous-titrage lent) ;
   score de prononciation = anneau qui se dessine en 1,2 s + compteur qui monte ;
   progression = barres qui poussent en 900 ms ; correction = pilule qui se déplie (hauteur + fondu 500 ms).
6. **Respiration.** Line-height 1.65, inter-titres +30 % d'air, et le CTA principal « respire » :
   halo qui gonfle/dégonfle sur un cycle de 6 s.
7. **Lent ≠ lourd.** Uniquement `transform` / `opacity` / `filter` (compositing GPU), zéro layout thrash,
   et `@media (prefers-reduced-motion: reduce)` → tout tombe à de simples fondus de 150 ms.

---

## 3. Direction artistique « Slow Flow »

**Mots-clés moodboard :** océan profond · apnée · crépuscule polaire · aurora · méditation Headspace ·
verre dépoli · bulles en ascension · sous-titrage cinématographique.

### 3.1 Design tokens (prêts à coller dans `styles.css`)

```css
:root {
  /* — Couleurs (existantes conservées) — */
  --bg: #0B1229; --card: #131D3A; --line: #24325C;
  --text: #E8ECF8; --muted: #93A0C4;
  --blue: #2563EB; --cyan: #22D3EE;
  --grad: linear-gradient(135deg, #2563EB, #22D3EE);
  --ok: #34D399; --danger: #F87171;

  /* — Nouveau : verre + lueurs — */
  --glass: rgba(19, 29, 58, 0.55);
  --glass-border: rgba(93, 120, 190, 0.28);
  --glow-cyan: 0 0 32px rgba(34, 211, 238, 0.22);
  --shadow-soft: 0 18px 50px rgba(3, 8, 24, 0.45);

  /* — Nouveau : durées slow motion — */
  --dur-fast: 200ms;   /* micro-feedback                    */
  --dur-in: 450ms;     /* entrées (bulles, cartes)          */
  --dur-state: 700ms;  /* transitions d'état/écran          */
  --dur-story: 1100ms; /* révélation (score, anneau, barre) */
  --dur-ambient: 30s;  /* boucles d'ambiance (aurora, vagues, orbes) */

  /* — Nouveau : courbes — */
  --ease-soft: cubic-bezier(0.22, 1, 0.36, 1);   /* posé, sans rebond       */
  --ease-breathe: cubic-bezier(0.65, 0, 0.35, 1); /* aller-retour respiré    */

  /* — Nouveau : rythme — */
  --stagger: 80ms;      /* cascade entre éléments frères */
  --radius-lg: 20px; --radius-xl: 24px;
}
```

Typographie : Inter (ou system-ui), corps **17 px / 1.65**, titres `letter-spacing: 0.02em`,
taille h1 `1.7rem` — la lecture ralentit d'elle-même quand l'air augmente.

### 3.2 Application écran par écran

| Écran | Traitement slow motion |
|---|---|
| **Shell** | Aurora de fond : 3 halos radiaux qui dérivent en 50 s (`translate` uniquement). Fine ligne de vague SVG sous le header, ondulation 20 s. Entrée de vue : fondu + `translateY(12px)` 700 ms, enfants en cascade 80 ms. |
| **Onboarding** | Icône dans un halo qui respire (6 s). Les 6 chips de niveau montent un à un (stagger 80 ms). L'anneau du chip sélectionné se dessine (SVG stroke 600 ms). CTA en halo respirant. |
| **Accueil** | Titre en fondu lent. Cartes scénarios : ascension décalée + ombre douce au survol qui se pose en 400 ms. Séparateur de vague entre sections. |
| **Conversation** | Bulles : `scale(.96) + blur(4px) → 1/0` en 450 ms. Streaming = révélation mot à mot (fondu 200 ms/mot). Correction : pilule verte qui se déplie 500 ms. Typing = 3 points-bulles qui montent en 1,8 s en boucle. Micro actif : 2 anneaux d'ondulation lents (2,2 s) au lieu du pulse. |
| **Progression** | Médailles flottent (bob 4 s). Badge gagné : balayage de lumière lent (shine 1,2 s). Barres par catégorie poussent en 900 ms expo-out, dans l'ordre décroissant. |
| **Prononciation** | Score : anneau gradient qui se dessine (`stroke-dashoffset`, 1 200 ms) pendant que le % compte de 0 à N. Mots : chips validés en vert doux, manqués barrés rouge — apparition séquentielle 80 ms. |
| **Leçons** | Accordéon : ouverture en 500 ms (`grid-template-rows` ou height auto animé), lignes de phrases en cascade 60 ms. |
| **Exercices** | Crossfade question→question 500 ms. Bonne réponse : lueur verte qui fleurit (box-shadow 800 ms). Erreur : léger balancement horizontal **lent** (±4 px, 600 ms) — jamais de shake sec. |
| **Réglages** | Sections en fondu décalé. Slider/check : trajet du pouce 300 ms ease-soft. « Enregistré » : checkmark SVG qui se trace en 600 ms. |

---

## 4. Prompts Google Stitch

### Mode d'emploi express
1. Ouvrir **stitch.withgoogle.com** (compte Google, gratuit — ~350 générations/mois en Standard).
2. Mode **Standard** pour explorer, **Experimental** pour la version finale.
3. Prompts **en anglais** (meilleurs résultats) mais **textes d'interface en français** (indiqué dans les prompts).
4. **Itérer** (petites corrections ciblées) plutôt que régénérer ; sauvegarder les versions qu'on aime (Branch).
5. Export **Figma** pour peaufiner, ou code directement.

### 4.1 STYLE CORE — à coller au début de chaque prompt (verbatim)

```
FluentFlow — a calm French-language learning web app (desktop web, responsive,
single centered column, max-width 780px). SLOW-MOTION aesthetic: meditative,
oceanic, everything feels like it floats gently underwater.
Colors: deep navy background #0B1229 with very soft radial glows of blue
#2563EB at 12% opacity and cyan #22D3EE at 8% opacity; glassmorphism cards
(fill rgba(19,29,58,0.55), 1px border rgba(93,120,190,0.28), border-radius
20px, frosted blur, soft wide shadows); signature gradient 135deg from
#2563EB to #22D3EE reserved for primary buttons, active chips and key numbers.
Text #E8ECF8, secondary #93A0C4, success #34D399, error #F87171.
Font Inter, body 17px with generous 1.65 line-height, airy spacing, lots of
whitespace. Recurring motif: a thin slow ocean-wave line and small floating
bubbles. Mood: Headspace meets deep ocean — premium, low-stimulation, patient.
All UI text must be in French.
```

### 4.2 Prompt « flow complet » (validation rapide de la direction)

```
[STYLE CORE]

Design one connected flow of 4 web screens for FluentFlow:
1) Onboarding "Bienvenue sur FluentFlow" with 6 large level pill chips
   (A1 Débutant, A2 Élémentaire, B1 Intermédiaire, B2 Avancé, C1 Autonome,
   C2 Maîtrise) and a gradient button "Continuer →".
2) Home "Prêt à parler anglais ?" with 4 glass scenario cards (Vie quotidienne,
   Voyage, Travail, Raconte ta journée), a full-width gradient button
   "💬 Conversation libre", 4 secondary chips (Prononciation, Leçons,
   Exercices ciblés, Ma progression) and a "Mes conversations" list.
3) Conversation: chat with gradient user bubbles on the right, glass tutor
   bubbles on the left with a small 🔊 icon, one green glass correction pill
   under a user bubble, and a sticky bottom input bar (rounded field
   "Écris en anglais…", round mic button, gradient "Envoyer" button).
4) Progress "Ma progression" with 3 medal badges (10/50/100 corrections) and
   a card of 5 horizontal stats bars (Articles, Prépositions, Temps,
   Orthographe, Ordre des mots).
Everything extremely airy and calm, like a slow underwater scene.
```

### 4.3 Prompts écran par écran (qualité maximale — un écran à la fois)

**Écran 1 — Onboarding**
```
[STYLE CORE]

Screen: onboarding. Centered layout, huge vertical breathing room.
Top: the FluentFlow app icon (a cyan wave inside a speech bubble on navy)
inside a soft glowing halo. Headline "Bienvenue sur FluentFlow 👋" and
subtitle "Quel est ton niveau d'anglais ? (tu pourras le changer plus tard)".
Below: 6 large pill chips in two rows, slightly floating with soft shadows:
"A1 — Débutant", "A2 — Élémentaire", "B1 — Intermédiaire", "B2 — Avancé",
"C1 — Autonome", "C2 — Maîtrise". The B1 chip is selected (gradient fill,
soft cyan glow). Bottom: full-width gradient button "Continuer →" with a
gentle glow. Nothing else on the screen — extreme minimalism.
```

**Écran 2 — Accueil**
```
[STYLE CORE]

Screen: home dashboard. Header: brand "FluentFlow" with wave icon top-left,
gear icon top-right. Greeting "Prêt à parler anglais ?" with a small level
chip "Niveau : B1 — Intermédiaire". Section "Choisis un scénario": 4 tall
glass scenario cards stacked vertically, each with a line-art emoji icon,
title and one-line muted description: "☀️ Vie quotidienne", "✈️ Voyage",
"💼 Travail", "🌙 Raconte ta journée". Then a full-width gradient button
"💬 Conversation libre". Then a wrap row of 4 outline chips: "🎤 Prononciation",
"📚 Leçons", "🎯 Exercices ciblés", "🏅 Ma progression". Bottom section
"Mes conversations": 2 history cards with a bold title, a muted one-line
preview, and a small trash button. A thin wave line separates the sections.
```

**Écran 3 — Conversation**
```
[STYLE CORE]

Screen: chat conversation. Top: back link "← Accueil". Chat area with generous
16px spacing between bubbles: user messages are gradient (blue→cyan) bubbles
aligned right with white text; tutor replies are large frosted-glass bubbles
aligned left, one of them with a small 🔊 replay icon in its corner. Under one
user bubble, a small green glass pill shows a correction: "✔️ I went to
school". At the bottom, a sticky input bar on a soft glow: rounded text field
with placeholder "Écris en anglais…", a round outline mic button 🎤, and a
gradient "Envoyer" button. Above the input, three small floating dots rise
slowly like bubbles (typing indicator). Calm, spacious, cinematic subtitles
feeling.
```

**Écran 4 — Progression**
```
[STYLE CORE]

Screen: progress dashboard. Title "Ma progression" and subtitle
"27 corrections reçues au total". Row of 3 round medal badges: 🥉 "10
corrections", 🥈 "50 corrections", 🥇 "100 corrections" — the first two look
earned with a subtle cyan glow, the last one dimmed. Card "Types d'erreurs"
with 5 horizontal stats rows, each: muted label, thin rounded gradient
progress bar, bold count: "Articles 9", "Prépositions 7", "Temps 6",
"Orthographe 3", "Ordre des mots 2" (bars sorted from longest to shortest).
Bottom: full-width outline danger button "Réinitialiser la progression" in
soft red #F87171. Medals appear to float with soft shadows.
```

**Écran 5 — Prononciation**
```
[STYLE CORE]

Screen: pronunciation trainer. Title "Prononciation", subtitle "Écoute la
phrase, répète-la au micro, et compare.". A glass card shows the large target
sentence "Could you pass me the salt, please?" with an outline button
"🔊 Écouter" on its right. Below, the hero of the screen: a huge "86 %"
number in gradient text surrounded by a thin circular progress ring (86% of
the circle drawn, gradient stroke, soft glow). Under it, the sentence repeated
as word chips: correct words in soft green, one missed word struck through in
soft red. A row of 4 small suggestion pills, then two buttons side by side:
gradient "🎤 Répéter au micro" and outline "⏭ Phrase suivante". Feels like a
slow sports-replay moment frozen in time.
```

**Écran 6 — Leçons**
```
[STYLE CORE]

Screen: offline lessons library. Title "Leçons", subtitle "Embarquées dans
l'app — aucun réseau requis.". Three large expandable glass accordion cards:
"🌅 Phrases du quotidien", "✈️ Voyages", "🗣 Small talk". The first card is
open, showing phrase rows separated by thin lines; each row has the English
phrase in bold ("Could you pass me the salt, please?"), the French translation
muted below ("Peux-tu me passer le sel, s'il te plaît ?"), a small outline 🔊
button and a small gradient "Pratiquer" button. The two other cards are closed
with a chevron. Very calm list rhythm, tall row height.
```

**Écran 7 — Exercices**
```
[STYLE CORE]

Screen: targeted grammar exercise. Title "Exercices ciblés", subtitle
"Priorisés selon tes erreurs les plus fréquentes en conversation.". Top of the
card: a thin progress bar one-third filled with the gradient, and a muted line
"Question 3 / 10 · Score : 2" next to a small category chip "Temps". Center:
the large exercise sentence "She ___ to school yesterday." then a rounded
answer input with placeholder "Ta réponse…", then a full-width gradient button
"Vérifier". Also show the success state on a second variant: a soft green glow
bloom around a line "✅ Bravo, c'est correct !", the correct answer
"She went to school yesterday.", a muted hint "💡 Verbes irréguliers : go →
went", and a gradient button "Suivant →". Meditative, no clutter.
```

**Écran 8 — Réglages**
```
[STYLE CORE]

Screen: settings. Title "Paramètres", subtitle "Tout est stocké localement
dans ton navigateur.". Three stacked glass cards. Card "Tuteur IA": a select
field "Fournisseur" with options OpenAI, OpenRouter, Gemini, Groq, Ollama
(local); a password field "Clé API" showing dots; a text field "Modèle" with
value "gpt-4o-mini"; a muted hint line under it. Card "Voix du tuteur": a
select "Voix" with an option like "Microsoft Aria Online (Natural) — English
(United States)", a slider "Vitesse : x1.0", an outline button "🔊 Tester la
voix", and a checkbox "Lecture automatique des réponses du tuteur" checked.
Card "Données": a full-width outline danger button "🗑 Effacer toutes les
conversations". Calm admin-panel feeling, lots of air between fields.
```

### 4.4 Prompts d'itération (après la première génération)

```
Increase vertical spacing between all sections by 30% — I want it to feel slower and calmer.
```
```
Keep the layout exactly, but make all cards frosted glass with 20px radius and softer, wider shadows.
```
```
Reduce the palette: only navy, the blue→cyan gradient and muted grey-blue text. Remove every other accent color.
```
```
Add a very subtle thin wave line under the header and a faint cyan glow under the primary button.
```
```
Make the headline larger (about 28px, Inter, letter-spacing 0.02em) and increase body line-height for a slow reading rhythm.
```

### 4.5 Checklist de cohérence (à vérifier sur chaque génération)

- [ ] Fond `#0B1229` avec halos bleu/cyan **à peine** visibles (pas de violet, pas de noir pur)
- [ ] Un seul dégradé signature, réservé aux CTA / éléments actifs / chiffres clés
- [ ] Cartes en verre 20 px, bordure fine claire, ombres larges et douces ( jamais dures)
- [ ] UI text **en français**, ton tutoiant, emojis fonctionnels (🎤 📚 🎯 🏅 🔊)
- [ ] Beaucoup d'air : si ça ne « respire » pas → prompt d'espacement (4.4)
- [ ] Contraste texte ≥ 4.5:1 (`#E8ECF8` sur `#131D3A` ≈ 12:1 ✓ ; éviter le cyan sur blanc)
- [ ] Penser `prefers-reduced-motion` au moment d'implémenter (les prompts Stitch décrivent le statique — le motion sera codé dans `styles.css` § 3.1)

---

## 5. Prochaines étapes

1. Générer les écrans dans Stitch (4.2 pour valider, puis 4.3 un par un, itérations 4.4).
2. Exporter le favori en Figma (référence visuelle) et/ou code.
3. Sur go : implémenter les tokens § 3.1 + les 8 recettes § 3.2 dans `src/styles.css`
   (motion réel : entrances, stagger, streaming mot à mot, anneau de score, aurora ambiant).
