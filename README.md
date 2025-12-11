# Holdify - Simulation Économique Holding et Filiale

## Présentation

Holdify est un outil de démonstration développé avec SvelteKit 5 et TypeScript qui permet de simuler les flux financiers entre une société holding et sa filiale. L'application facilite l'analyse de l'impact des décisions fiscales et financières sur une période donnée.

Dans ce modèle, la holding génère les profits, paie l'impôt sur les sociétés, distribue des dividendes à ses actionnaires et peut reverser des fonds à la filiale selon une politique configurable.

### Fonctionnalités principales

- Simulation complète mois par mois avec volatilité et croissance
- Calculs fiscaux paramétrables (IS de la holding)
- Gestion des actionnaires avec calcul des dividendes
- Politique de reversement flexible (aucun, pourcentage, conditionnel, ou par paliers selon le bénéfice)
- Visualisations graphiques interactives (Chart.js)
- Tableau détaillé des flux financiers
- Export CSV et PDF des résultats
- Interface moderne et responsive (Tailwind CSS, thème monochrome)
- Architecture modulaire et testable

## Installation et Démarrage

### Prérequis

- Node.js 18 ou supérieur
- npm, pnpm ou yarn

### Installation des dépendances

```bash
npm install
```

### Développement

Lancer le serveur de développement :

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173` (ou le port indiqué dans la console).

Pour ouvrir automatiquement dans le navigateur :

```bash
npm run dev -- --open
```

### Build de production

Créer une version optimisée :

```bash
npm run build
```

### Prévisualisation du build

Tester la version de production localement :

```bash
npm run preview
```

### Tests unitaires

Lancer les tests :

```bash
npm test
```

Interface de tests interactive :

```bash
npm run test:ui
```

### Vérification TypeScript

Vérifier les types :

```bash
npm run check
```

## Architecture du Projet

```
holdify/
├── src/
│   ├── lib/
│   │   ├── simulator.ts          # Logique de simulation fiscale (cœur métier)
│   │   ├── simulator.test.ts     # Tests unitaires
│   │   └── charts/
│   │       └── LineChart.svelte  # Composant wrapper Chart.js réactif
│   ├── routes/
│   │   ├── +layout.svelte        # Layout principal (inclut Tailwind)
│   │   └── +page.svelte          # Page principale (formulaire + visualisations)
│   └── styles/
│       └── tailwind.css          # Styles Tailwind (thème monochrome)
├── tailwind.config.cjs           # Configuration Tailwind
├── postcss.config.cjs            # Configuration PostCSS
├── vite.config.ts                # Configuration Vite avec Vitest
├── package.json                  # Dépendances et scripts
└── README.md                     # Ce fichier
```

## Paramètres de Simulation

### Paramètres Financiers

- **Profit Mensuel de Base** : Montant de profit généré par la holding chaque mois (en euros)
- **Volatilité** : Écart-type en pourcentage (0-50%) pour simuler la variabilité des profits
- **Taux de Croissance Mensuel** : Croissance exponentielle mensuelle (0-10%)

### Capitaux

- **Capital Initial Filiale** : Capital de départ de la filiale (en euros)
- **Capital Initial Holding** : Capital de départ de la holding, en plus des investissements des actionnaires (en euros)
- **Durée** : Nombre de mois à simuler (1-120)

Note : Les investissements des actionnaires sont automatiquement ajoutés au capital initial de la holding lors de la simulation.

### Politique de Reversement

Quatre modes disponibles :

1. **Aucun** : Pas de reversement de la holding vers la filiale
2. **Pourcentage du Capital Holding** : Reversement d'un pourcentage fixe du capital holding chaque mois
3. **Conditionnel (seuil capital)** : Reversement d'un montant fixe si le capital holding dépasse un seuil
4. **Par Paliers (selon bénéfice)** : Reversement selon des paliers basés sur le bénéfice net de la holding
   - Si bénéfice net ≥ seuil 1, alors reverser montant 1
   - Si bénéfice net ≥ seuil 2, alors reverser montant 2
   - Et ainsi de suite (le palier le plus élevé atteint est appliqué)

### Paramètres Actionnaires

Pour chaque actionnaire, vous pouvez configurer :

- **Nom** : Identifiant de l'actionnaire
- **Investissement** : Montant investi dans la holding (en euros)
- **Taux de Dividende Annuel** : Pourcentage annuel de dividendes basé sur l'investissement (en décimal, ex: 0.05 pour 5%)

Les dividendes sont calculés mensuellement à partir du profit net de la holding (après IS), proportionnellement à l'investissement de chaque actionnaire.

### Paramètres Fiscaux

#### Impôt sur les Sociétés (IS)

Barème progressif configurable avec jusqu'à 3 tranches :

- **Tranche 1** : Seuil et taux (ex: 0€ à 15%)
- **Tranche 2** : Seuil et taux (ex: 42 500€ à 25%)
- **Tranche 3** : Seuil et taux (ex: 500 000€ à 28%)

L'IS est calculé sur le profit brut de la holding selon ce barème progressif.

Note : Les taux PFU (IR + prélèvements sociaux) ne sont plus utilisés dans ce modèle. Les dividendes sont calculés directement depuis le profit net de la holding.

## Résultats de Simulation

### Graphiques

Trois graphiques interactifs sont générés automatiquement :

1. **Évolution des Profits** : Profit brut vs Profit net de la holding
2. **Dividendes et Reversements** : Dividendes versés aux actionnaires vs Reversements vers la filiale
3. **Évolution des Capitaux** : Capital filiale vs Capital holding

### Tableau Détaillé

Le tableau affiche pour chaque mois :

- **Profit Brut Holding** : Bénéfice avant IS
- **IS Payé** : Impôt sur les sociétés payé par la holding
- **Profit Net Holding** : Profit après IS
- **Dividendes Actionnaires** : Montant total des dividendes versés aux actionnaires
- **Reversement → Filiale** : Montant reversé de la holding vers la filiale
- **Capital Filiale** : Capital final de la filiale
- **Capital Holding** : Capital final de la holding

### Export des Résultats

Deux options d'export sont disponibles :

- **Export CSV** : Exporte le tableau détaillé dans un fichier CSV pour analyse dans un tableur
- **Export PDF** : Génère un PDF complet de la page avec tous les résultats et graphiques

## Règles Fiscales et Ajustements

### Où Ajuster les Taux Fiscaux

Les taux fiscaux sont paramétrables et doivent être vérifiés auprès des sources officielles (impots.gouv.fr) avant toute utilisation réelle.

#### Fichier : `src/lib/simulator.ts`

##### Barème IS (lignes 133-138)

```typescript
export const DEFAULT_IS_BRACKETS: TaxBracket[] = [
	{ threshold: 0, rate: 0.15 },      // Taux réduit pour les PME
	{ threshold: 42500, rate: 0.25 },  // Taux intermédiaire
	{ threshold: 500000, rate: 0.28 }, // Taux standard
	{ threshold: 5000000, rate: 0.31 }  // Taux majoré
];
```

Pour ajuster : Modifiez les valeurs `threshold` (seuils en euros) et `rate` (taux en décimal, ex: 0.15 pour 15%).

##### Paramètres fiscaux par défaut (lignes 145-150)

```typescript
export const DEFAULT_TAX_PARAMS: TaxParameters = {
	isBrackets: DEFAULT_IS_BRACKETS,
	dividendIrRate: 0.128,      // 12.8% - Non utilisé dans le modèle actuel
	dividendSocialRate: 0.172   // 17.2% - Non utilisé dans le modèle actuel
};
```

Note : Les taux `dividendIrRate` et `dividendSocialRate` sont conservés pour compatibilité mais ne sont plus utilisés dans le calcul. Les dividendes sont calculés directement depuis le profit net.

##### Fonction de calcul IS (lignes 165-195)

La fonction `calculateIS()` applique le barème progressif. Elle est déjà paramétrable via les `TaxBracket[]`.

### Logique de Simulation

1. **Génération du profit brut** : La holding génère un profit mensuel avec volatilité et croissance
2. **Calcul de l'IS** : L'IS est calculé sur le profit brut selon le barème progressif
3. **Profit net** : Profit brut - IS
4. **Dividendes actionnaires** : Calculés depuis le profit net, proportionnellement aux investissements et selon les taux annuels configurés
5. **Reversement filiale** : Calculé selon la politique de reversement (aucun, pourcentage, conditionnel, ou paliers)
6. **Mise à jour des capitaux** :
   - Filiale : Capital + Reversement
   - Holding : Capital + Profit net - Dividendes actionnaires - Reversement filiale

## Tests Unitaires

Les tests unitaires couvrent :

- Calcul de l'IS avec différents barèmes
- Calcul des dividendes actionnaires
- Simulation complète avec différentes politiques de reversement
- Export CSV

Fichier de tests : `src/lib/simulator.test.ts`

## Design et Accessibilité

### Thème

- Couleurs : Noir, blanc, niveaux de gris uniquement (monochrome)
- Typographie : Police système, tailles adaptatives
- Responsive : Design adaptatif mobile/tablette/desktop

### Accessibilité

- Labels sur tous les inputs
- Focus visible pour la navigation au clavier
- Contrastes respectant WCAG AA
- Structure sémantique HTML

## Exemple d'Utilisation

### Configuration Réaliste pour 12 Mois

1. **Profit Mensuel de Base** : 10 000€ (généré par la holding)
2. **Volatilité** : 10%
3. **Taux de Croissance** : 2% mensuel
4. **Capital Initial Filiale** : 0€
5. **Capital Initial Holding** : 0€ (le capital vient des actionnaires)
6. **Actionnaires** :
   - Actionnaire 1 : Investissement 50 000€, Taux dividende 5% annuel
   - Actionnaire 2 : Investissement 30 000€, Taux dividende 4% annuel
7. **Politique de Reversement** : Par paliers
   - Si bénéfice ≥ 10 000€ : reverser 2 000€
   - Si bénéfice ≥ 20 000€ : reverser 5 000€
8. **Durée** : 12 mois
9. **Paramètres Fiscaux** : Valeurs par défaut (à vérifier)

Cliquez sur "Simuler" pour générer les résultats et visualiser les graphiques.

## Technologies Utilisées

- **SvelteKit 5** : Framework avec routing et SSR
- **Svelte 5** : Runes ($state, $derived, $effect) pour la réactivité
- **TypeScript** : Typage strict
- **Tailwind CSS** : Styling utilitaire
- **Chart.js** : Graphiques interactifs
- **html2pdf.js** : Génération de PDF
- **Vitest** : Tests unitaires

## Licence

Ce POC est fourni à titre d'exemple et de démonstration. Les calculs fiscaux sont indicatifs et ne constituent pas un conseil fiscal.

## Avertissements

1. **Taux Fiscaux** : Les taux par défaut sont indicatifs. Vérifiez toujours les taux officiels avant utilisation réelle.
2. **Conseil Fiscal** : Cet outil ne remplace pas un conseil fiscal professionnel.
3. **Simulation** : Les résultats sont basés sur des modèles mathématiques et peuvent différer de la réalité.

## Contribution

Ce POC est un projet de démonstration. Pour toute amélioration ou correction, veuillez vérifier la cohérence fiscale avec les sources officielles.

---

Développé avec SvelteKit 5 + TypeScript | Thème Monochrome | POC Holdify
