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
	let useCapitalBasedRevenue = $state(formStore.useCapitalBasedRevenue);
	let capitalRevenueRate = $state(formStore.capitalRevenueRate);
	
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
			dividendOnProfitRatio,
			useCapitalBasedRevenue,
			capitalRevenueRate
		};

		const results = runSimulation(params);
		simulationResults = results;
		hasRunSimulation = true;
		simulationStore.setResults(results);
	}

	// État pour gérer le chargement du PDF
	let isGeneratingPDF = $state(false);

	/**
	 * Exporte la page en PDF
	 */
	async function handleExportPDF() {
		if (!browser || !hasRunSimulation || isGeneratingPDF) return;

		// Sélectionner uniquement le main (sans Header ni Footer)
		const element = document.querySelector('main') as HTMLElement;
		if (!element) return;

		isGeneratingPDF = true;

		try {
			// Préparer les données du formulaire
			const formData = {
				baseMonthlyRevenueHolding,
				baseMonthlyRevenueSubsidiary,
				baseMonthlyChargesHolding,
				baseMonthlyChargesSubsidiary,
				initialSubsidiaryCapital,
				durationMonths,
				volatility,
				monthlyGrowthRate,
				dividendOnProfitRatio,
				useCapitalBasedRevenue,
				capitalRevenueRate,
				shareholders: shareholders.filter(sh => sh.name.trim() !== '' && sh.investment > 0),
				isBracket1Threshold,
				isBracket1Rate,
				isBracket2Threshold,
				isBracket2Rate,
				isBracket3Threshold,
				isBracket3Rate,
				dividendIrRate,
				dividendSocialRate
			};

			await exportToPDF(element, 'simulation_holdify', formData, simulationResults);
		} catch (error) {
			console.error('Erreur lors de la génération du PDF:', error);
			alert('Une erreur est survenue lors de la génération du PDF.');
		} finally {
			isGeneratingPDF = false;
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
					bind:useCapitalBasedRevenue
					bind:capitalRevenueRate
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
							disabled={isGeneratingPDF}
						>
							{isGeneratingPDF ? 'Génération...' : 'Télécharger en PDF'}
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
