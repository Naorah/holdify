<!--
	Page principale du POC Holdify - Simulation économique Holding ↔ Filiale
	
	Cette page utilise une architecture modulaire :
	- Stores pour la gestion de l'état (form.store.ts, simulation.store.ts)
	- Services pour la logique métier (simulation.service.ts, export.service.ts)
	- Composants pour l'UI (forms/, results/, ui/)
	- Utils pour les fonctions utilitaires (formatters.ts, pdf.ts)
-->

<script lang="ts">
	import { browser } from '$app/environment';
	
	// Stores
	import { formStore } from '$lib/stores/form.store';
	import { simulationStore } from '$lib/stores/simulation.store';
	
	// Services
	import { runSimulation } from '$lib/services/simulation.service';
	import { exportToPDF } from '$lib/utils/pdf';
	
	// Types
	import type { ReversalPolicy } from '$lib/types/simulation.types';
	
	// Composants UI
	import Header from '$lib/components/ui/Header.svelte';
	import Footer from '$lib/components/ui/Footer.svelte';
	
	// Composants Forms
	import FinancialParamsForm from '$lib/components/forms/FinancialParamsForm.svelte';
	import CapitalsForm from '$lib/components/forms/CapitalsForm.svelte';
	import ReversalPolicyForm from '$lib/components/forms/ReversalPolicyForm.svelte';
	import ShareholdersForm from '$lib/components/forms/ShareholdersForm.svelte';
	import TaxParamsForm from '$lib/components/forms/TaxParamsForm.svelte';
	
	// Composants Results
	import ResultsCharts from '$lib/components/results/ResultsCharts.svelte';
	import ResultsTable from '$lib/components/results/ResultsTable.svelte';

	// ============================================================================
	// ÉTAT RÉACTIF DU FORMULAIRE
	// ============================================================================
	// Utiliser $state pour chaque propriété individuellement pour permettre les bindings

	// Paramètres financiers
	let baseMonthlyRevenueHolding = $state(formStore.baseMonthlyRevenueHolding);
	let baseMonthlyRevenueSubsidiary = $state(formStore.baseMonthlyRevenueSubsidiary);
	let baseMonthlyChargesHolding = $state(formStore.baseMonthlyChargesHolding);
	let baseMonthlyChargesSubsidiary = $state(formStore.baseMonthlyChargesSubsidiary);
	let volatility = $state(formStore.volatility);
	let monthlyGrowthRate = $state(formStore.monthlyGrowthRate);
	let dividendOnProfitRatio = $state(formStore.dividendOnProfitRatio);
	
	// Capitaux
	let initialSubsidiaryCapital = $state(formStore.initialSubsidiaryCapital);
	let durationMonths = $state(formStore.durationMonths);

	// Politique de reversement
	let reversalPolicyType = $state(formStore.reversalPolicyType);
	let reversalPercentage = $state(formStore.reversalPercentage);
	let reversalThreshold = $state(formStore.reversalThreshold);
	let reversalAmount = $state(formStore.reversalAmount);
	let reversalTiers = $state(formStore.reversalTiers);

	// Actionnaires
	let shareholders = $state(formStore.shareholders);

	// Paramètres fiscaux
	let isBracket1Threshold = $state(formStore.isBracket1Threshold);
	let isBracket1Rate = $state(formStore.isBracket1Rate);
	let isBracket2Threshold = $state(formStore.isBracket2Threshold);
	let isBracket2Rate = $state(formStore.isBracket2Rate);
	let isBracket3Threshold = $state(formStore.isBracket3Threshold);
	let isBracket3Rate = $state(formStore.isBracket3Rate);
	let dividendIrRate = $state(formStore.dividendIrRate);
	let dividendSocialRate = $state(formStore.dividendSocialRate);

	// État de la simulation
	let simulationResults = $state(simulationStore.results);
	let hasRunSimulation = $state(simulationStore.hasRunSimulation);

	// ============================================================================
	// ACTIONS
	// ============================================================================

	/**
	 * Lance la simulation avec les paramètres du formulaire
	 */
	function runSimulationHandler() {
		// Construire les paramètres à partir des variables réactives
		const params = {
			baseMonthlyRevenueHolding,
			baseMonthlyRevenueSubsidiary,
			baseMonthlyChargesHolding,
			baseMonthlyChargesSubsidiary,
			volatility,
			monthlyGrowthRate,
			dividendPayoutRatio: 0,
			initialSubsidiaryCapital,
			initialHoldingCapital: 0,
			reversalPolicy: ((): ReversalPolicy => {
				switch (reversalPolicyType) {
					case 'pct_of_holding':
						return { type: 'pct_of_holding', percentage: reversalPercentage };
					case 'conditional':
						return { type: 'conditional', threshold: reversalThreshold, amount: reversalAmount };
					case 'tiered':
						return { type: 'tiered', tiers: reversalTiers.filter(t => t.profitThreshold > 0 && t.amount > 0) };
					default:
						return { type: 'none' };
				}
			})(),
			durationMonths,
			taxParams: {
				isBrackets: [
					{ threshold: isBracket1Threshold, rate: isBracket1Rate },
					{ threshold: isBracket2Threshold, rate: isBracket2Rate },
					{ threshold: isBracket3Threshold, rate: isBracket3Rate }
				],
				dividendIrRate,
				dividendSocialRate
			},
			shareholders: shareholders.filter(sh => sh.name.trim() !== '' && sh.investment > 0),
			dividendOnProfitRatio
		};

		const results = runSimulation(params);
		simulationResults = results;
		hasRunSimulation = true;
		simulationStore.setResults(results);
	}

	/**
	 * Exporte la page en PDF
	 */
	async function handleExportPDF() {
		if (!browser || !hasRunSimulation) return;

		const element = document.querySelector('.min-h-screen') as HTMLElement;
		if (!element) return;

		try {
			await exportToPDF(element, 'simulation_holdify');
		} catch (error) {
			console.error('Erreur lors de la génération du PDF:', error);
			alert('Une erreur est survenue lors de la génération du PDF.');
		}
	}

	/**
	 * Réinitialise les paramètres fiscaux
	 */
	function resetTaxParams() {
		formStore.resetTaxParams();
		isBracket1Threshold = formStore.isBracket1Threshold;
		isBracket1Rate = formStore.isBracket1Rate;
		isBracket2Threshold = formStore.isBracket2Threshold;
		isBracket2Rate = formStore.isBracket2Rate;
		isBracket3Threshold = formStore.isBracket3Threshold;
		isBracket3Rate = formStore.isBracket3Rate;
		dividendIrRate = formStore.dividendIrRate;
		dividendSocialRate = formStore.dividendSocialRate;
	}
</script>

<svelte:head>
	<!-- SEO de base -->
	<title>Holdify - Simulation Économique Holding ↔ Filiale</title>
	<meta name="description" content="Outil de simulation économique pour analyser les flux financiers entre une holding et sa filiale. Calculez l'IS, les dividendes, le PFU et visualisez l'évolution des capitaux avec des graphiques interactifs." />
	<meta name="keywords" content="holding, filiale, simulation économique, IS, impôt sur les sociétés, dividendes, PFU, prélèvement forfaitaire unique, fiscalité, gestion financière, calcul fiscal" />
	<meta name="author" content="Holdify" />
	<meta name="robots" content="index, follow" />
	<meta name="language" content="French" />
	<link rel="canonical" href="https://holdify.app" />

	<!-- Open Graph / Facebook -->
	<meta property="og:type" content="website" />
	<meta property="og:url" content="https://holdify.app" />
	<meta property="og:title" content="Holdify - Simulation Économique Holding ↔ Filiale" />
	<meta property="og:description" content="Outil de simulation économique pour analyser les flux financiers entre une holding et sa filiale. Calculez l'IS, les dividendes, le PFU et visualisez l'évolution des capitaux." />
	<meta property="og:image" content="https://holdify.app/og-image.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content="Holdify - Simulation Économique Holding ↔ Filiale" />
	<meta property="og:locale" content="fr_FR" />
	<meta property="og:site_name" content="Holdify" />

	<!-- Twitter Card -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:url" content="https://holdify.app" />
	<meta name="twitter:title" content="Holdify - Simulation Économique Holding ↔ Filiale" />
	<meta name="twitter:description" content="Outil de simulation économique pour analyser les flux financiers entre une holding et sa filiale. Calculez l'IS, les dividendes, le PFU et visualisez l'évolution des capitaux." />
	<meta name="twitter:image" content="https://holdify.app/og-image.png" />
	<meta name="twitter:image:alt" content="Holdify - Simulation Économique Holding ↔ Filiale" />

	<!-- Mobile & App -->
	<meta name="theme-color" content="#000000" />
	<meta name="mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="Holdify" />

	<!-- Schema.org JSON-LD pour le SEO structuré -->
	{@html `
		<script type="application/ld+json">
		{
			"@context": "https://schema.org",
			"@type": "WebApplication",
			"name": "Holdify",
			"description": "Outil de simulation économique pour analyser les flux financiers entre une holding et sa filiale",
			"url": "https://holdify.app",
			"applicationCategory": "FinanceApplication",
			"operatingSystem": "Web",
			"offers": {
				"@type": "Offer",
				"price": "0",
				"priceCurrency": "EUR"
			},
			"featureList": [
				"Simulation économique mois par mois",
				"Calcul de l'Impôt sur les Sociétés (IS)",
				"Calcul des dividendes et du PFU",
				"Visualisations graphiques interactives",
				"Export CSV des résultats"
			]
		}
		</script>
	`}
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white text-black">
	<Header />

	<main class="container mx-auto px-4 sm:px-6 lg:px-2 py-6 sm:py-8 lg:py-12 max-w-[98%]">
		<!-- Formulaire de paramétrage -->
		<section class="border-2 border-gray-300 bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8 sm:mb-12">
			<h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 border-b-2 border-black pb-3">Paramètres de Simulation</h2>

			<form
				onsubmit={(e) => { e.preventDefault(); runSimulationHandler(); }}
				class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
			>
				<!-- Paramètres Financiers -->
				<FinancialParamsForm
					bind:baseMonthlyRevenueHolding
					bind:baseMonthlyRevenueSubsidiary
					bind:baseMonthlyChargesHolding
					bind:baseMonthlyChargesSubsidiary
					bind:volatility
					bind:monthlyGrowthRate
					bind:dividendOnProfitRatio
				/>

				<!-- Capitaux -->
				<CapitalsForm
					bind:initialSubsidiaryCapital
					bind:durationMonths
				/>

				<!-- Politique de Reversement -->
				<ReversalPolicyForm
					bind:reversalPolicyType
					bind:reversalPercentage
					bind:reversalThreshold
					bind:reversalAmount
					bind:reversalTiers
				/>

				<!-- Paramètres Actionnaires -->
				<ShareholdersForm bind:shareholders />

				<!-- Paramètres Fiscaux -->
				<TaxParamsForm
					bind:isBracket1Threshold
					bind:isBracket1Rate
					bind:isBracket2Threshold
					bind:isBracket2Rate
					bind:isBracket3Threshold
					bind:isBracket3Rate
					bind:dividendIrRate
					bind:dividendSocialRate
					resetTaxParams={resetTaxParams}
				/>

				<!-- Boutons de simulation et export -->
				<div class="md:col-span-2 lg:col-span-3 flex flex-col sm:flex-row gap-4">
					<button type="submit" class="px-8 py-3 text-lg font-semibold transition-all duration-300 border-2 border-black bg-black text-white hover:bg-gray-800 hover:border-gray-800 shadow-md hover:shadow-xl active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg w-full sm:w-auto">
						Simuler
					</button>
					{#if hasRunSimulation && simulationResults.length > 0}
						<button
							type="button"
							class="px-8 py-3 text-lg font-semibold transition-all duration-300 border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg w-full sm:w-auto"
							onclick={handleExportPDF}
						>
							Télécharger en PDF
						</button>
					{/if}
				</div>
			</form>
		</section>

		<!-- Résultats de simulation -->
		{#if hasRunSimulation && simulationResults.length > 0}
			<ResultsCharts results={simulationResults} />
			<ResultsTable results={simulationResults} />
		{/if}
	</main>

	<Footer />
</div>
