<p align="center">
  <img src="src/lib/assets/favicon_white.png" alt="Holdify Logo" width="120" height="120" style="filter: invert(1) brightness(10);">
</p>

<h1 align="center">Holdify</h1>
<p align="center"><em>Simulation professionnelle des flux financiers entre holding et filiale</em></p>

---

## Présentation

**Holdify** est un outil de simulation avancé développé avec SvelteKit 5 et TypeScript, conçu pour modéliser et analyser les flux financiers et fiscaux entre une société holding et sa filiale. Cet outil s'adresse aux professionnels de la finance, de la gestion d'entreprise, aux business angels, ou encore aux entrepreneurs souhaitant explorer l'impact des différentes politiques financières et fiscales sur leurs structures d'investissement.

Le modèle intégré permet notamment de :
- Générer et faire évoluer les profits d'une holding avec prise en compte de la volatilité et de la croissance.
- Calculer automatiquement l'impôt sur les sociétés selon un barème personnalisable.
- Disposer de multiples politiques de reversement vers la filiale (aucun, pourcentage, conditionnel, paliers sur bénéfice).
- Gérer plusieurs actionnaires avec calcul de dividendes personnalisés.
- Visualiser instantanément les résultats (tableaux, graphiques interactifs).
- Exporter les données pour analyse ou reporting (CSV, PDF).

---

## Fonctionnalités Clés

- **Simulation mensuelle détaillée** (profits, capitaux, reversements, dividendes…)
- **Gestion fiscale avancée** (barème IS progressif paramétrable)
- **Politique de reversement flexible** : Aucun, pourcentage, conditionnel, par paliers
- **Multi-actionnaires** : investissements, taux de dividendes
- **Visualisations interactives** (graphiques Chart.js)
- **Exports professionnels** (CSV, PDF complet de la page)
- **Interface responsive, sobre, et ergonomique** (mono-chrome, Tailwind CSS)
- **Architecture modulaire & typée TypeScript**
- **Tests unitaires** (Vitest)

---

## Installation et Mise en Route

### Prérequis

- Node.js ≥ 18
- Un gestionnaire de paquets : npm / pnpm / yarn

### Installation

```bash
npm install
```

### Lancement en développement

```bash
npm run dev
```
Application accessible sur [http://localhost:5173](http://localhost:5173)

Pour ouvrir dans le navigateur automatiquement :
```bash
npm run dev -- --open
```

### Production

Build optimisé :
```bash
npm run build
```

Prévisualisation locale du build :
```bash
npm run preview
```

### Tests et Types

Lancer la suite de tests unitaires :
```bash
npm test
```
Interface de tests :
```bash
npm run test:ui
```

Vérifier la cohérence des types TypeScript :
```bash
npm run check
```

---

## Architecture du Projet

```
holdify/
├── src/
│   ├── lib/
│   │   ├── simulator.ts          # Moteur de simulation (coeur métier)
│   │   ├── simulator.test.ts     # Tests unitaires
│   │   └── charts/
│   │       └── LineChart.svelte  # Wrapper Chart.js Svelte
│   ├── routes/
│   │   ├── +layout.svelte        # Layout général (Base Tailwind)
│   │   └── +page.svelte          # Front principal : formulaire, vues, exports
│   └── styles/
│       └── tailwind.css          # Thème monochrome (noir, blanc, gris)
├── tailwind.config.cjs           # Config. Tailwind
├── postcss.config.cjs            # Config. PostCSS
├── vite.config.ts                # Vite (build, test)
├── package.json                  # Dépendances, scripts, meta
└── README.md                     # Présentation
```

---

## Paramètres de Simulation

### 1. Paramètres Financiers

- **Profit mensuel de base** : Euros générés par la holding chaque mois
- **Volatilité (%)** : Simule la variabilité (0–50%)
- **Croissance mensuelle (%)** : Taux de croissance exponentielle mensuelle (0–10%)

### 2. Capitaux

- **Capital initial Filiale** : Fonds de départ de la filiale
- **Capital initial Holding** : Fonds propres de la holding (hors actionnaires)
- **Durée** : Nombre de mois à simuler (1–120)

> *Note : L’investissement des actionnaires s’additionne automatiquement au capital holding.*

### 3. Politiques de Reversement

Quatre modes disponibles :
- **Aucun** : Pas de reversement
- **Pourcentage du capital holding** : Reversement d’un % chaque mois
- **Conditionnel (seuil capital)** : Reversement d’un montant fixe quand seuil atteint
- **Par paliers (sur bénéfice)** : Reversement selon des seuils de résultat net

### 4. Actionnaires

Pour chaque actionnaire :
- **Nom**
- **Investissement initial**
- **Taux de dividende annuel (%)**

> *Dividende calculé mensuellement sur le profit net post-IS, prorata du montant investi.*

### 5. Fiscalité

#### Impôt sur les Sociétés (IS)

Barème progressif personnalisable (jusqu’à 3 tranches, voir `src/lib/simulator.ts`), par défaut :

- Tranche 1 : 0 € — 15 %
- Tranche 2 : 42 500 € — 25 %
- Tranche 3 : 500 000 € — 28 %
- Tranche 4 : 5 000 000 € — 31 %

> *Adaptez les seuils/taux pour refléter la fiscalité en vigueur : voir [impots.gouv.fr](https://www.impots.gouv.fr/). Les PFU/IR/prélèvements sociaux ne sont pas réappliqués (dividende prélevé dans le résultat net).*

---

## Résultats de la Simulation

### Graphiques générés (Chart.js)

1. **Evolution des profits** : Profit brut vs. net holding
2. **Dividendes & reversements** : Actionnaires, filiale
3. **Evolution des capitaux** : Filiale vs. holding

### Tableau détaillé mensuel

Affiche : profit brut, IS payé, profit net, dividendes, reversement filiale, capital fin de période (holding & filiale)

### Exports

- **CSV** : Tableur, reporting, audit
- **PDF** : Rapport professionnel incluant graphiques et tableaux

---

## Règles et Ajustements Fiscaux

Tous les taux et barèmes sont <u>paramétrables</u> dans [`src/lib/simulator.ts`](src/lib/simulator.ts).
Pour une conformité réelle, adaptez en fonction des textes légaux.

Exemple :

```typescript
export const DEFAULT_IS_BRACKETS: TaxBracket[] = [
  { threshold: 0, rate: 0.15 },       // PME
  { threshold: 42500, rate: 0.25 },   // Intermédiaire
  { threshold: 500000, rate: 0.28 },  // Standard
  { threshold: 5000000, rate: 0.31 }  // Majoré
];
```

Fonction de calcul IS : voir `calculateIS()`.

---

## Logique de Simulation

1. **Génération d’un profit brut** (volatilité + croissance)
2. **Calcul progressif IS**
3. **Résultat net** = profit brut – IS
4. **Versement dividendes actionnaires** (prorata investissements, taux annuel)
5. **Reversement filiale** (politique sélectionnée)
6. **Mise à jour capitaux** : filiale (ajout reversement), holding (profit net – dividendes – reversement)

---

## Tests Unitaires

- Simulation IS (taux, seuils)
- Dividendes actionnaires
- Simulation globale (reversements, impacts, exports)
- Exports CSV

> *Tests : voir [`src/lib/simulator.test.ts`](src/lib/simulator.test.ts)*

---

## Qualité, Design & Accessibilité

- **Design** : Monochrome, typographie sobre adaptée à tous formats
- **Responsive** : Mobile, tablette, desktop
- **Accessibilité** : Labels systématiques, navigation clavier, contraste conforme AA, structure sémantique

---

## Exemple d’Utilisation Professionnelle

### Cas d'école sur 12 mois

| Paramètre | Valeur Exemple |
|-----------|---------------|
| Profit mensuel | 10 000 € |
| Volatilité | 10 % |
| Croissance mensuelle | 2 % |
| Capital initial filiale | 0 € |
| Capital initial holding | 0 € |
| Actionnaires | 1: 50k€ @ 5% / 2: 30k€ @ 4% |
| Politique reversement | Paliers (≥ 10k€ : 2k€, ≥ 20k€ : 5k€) |
| Durée simulation | 12 mois |
| Barèmes fiscaux | Par défaut |

—> Lancez la simulation, consultez tableaux/graphes, exportez vos résultats.

---

## Technologies

- **SvelteKit 5** (routage, SSR, typage fort)
- **Svelte 5** (runic/reactivité moderne)
- **TypeScript** (robustesse, lisibilité)
- **Tailwind CSS** (thème sobre, responsive)
- **Chart.js** (analyse graphique)
- **Vitest** (tests unitaires)
- **html2pdf.js** (export PDF)

---

## Licence & Avertissements

Ce projet est un POC à finalité pédagogique et technique. Il ne constitue ni un conseil juridique ni fiscal. **Vérifiez systématiquement les barèmes fiscaux officiels.**

- **Taux par défaut à adapter**
- **Simulation indicative**
- **Aucune responsabilité fiscale ou juridique**

---

## Contribution

Pour toute suggestion/bug, ouvrez une issue ou une PR. Merci de valider les cohérences fiscales avec les sources officielles.

---

<p align="center">
  <strong>Développé avec SvelteKit 5 + TypeScript | Design Monochrome | © Holdify - 2024</strong>
</p>

