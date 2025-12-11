<!--
	Composant d'affichage des graphiques de résultats
-->

<script lang="ts">
	import LineChart from '$lib/charts/LineChart.svelte';
	import type { MonthlyResult } from '$lib/types/simulation.types';

	interface Props {
		results: MonthlyResult[];
	}

	let { results }: Props = $props();

	const chartData = $derived.by(() => {
		if (results.length === 0) {
			return {
				results: { labels: [], datasets: [] },
				revenuesCharges: { labels: [], datasets: [] },
				dividends: { labels: [], datasets: [] },
				capitals: { labels: [], datasets: [] }
			};
		}

		const labels = results.map((r) => `Mois ${r.month}`);

		return {
			results: {
				labels,
				datasets: [
					{
						label: 'Résultat Holding',
						data: results.map((r) => r.resultHolding)
					},
					{
						label: 'Résultat Filiale',
						data: results.map((r) => r.resultSubsidiary)
					},
					{
						label: 'Bénéfice Holding',
						data: results.map((r) => r.profitHolding)
					}
				]
			},
			revenuesCharges: {
				labels,
				datasets: [
					{
						label: 'Recettes Holding',
						data: results.map((r) => r.revenueHolding)
					},
					{
						label: 'Charges Holding',
						data: results.map((r) => r.chargesHolding)
					},
					{
						label: 'Recettes Filiale',
						data: results.map((r) => r.revenueSubsidiary)
					},
					{
						label: 'Charges Filiale',
						data: results.map((r) => r.chargesSubsidiary)
					}
				]
			},
			dividends: {
				labels,
				datasets: [
					{
						label: 'Dividende sur Bénéfice',
						data: results.map((r) => r.dividendOnProfit)
					},
					{
						label: 'Dividendes Actionnaires',
						data: results.map((r) => r.shareholdersDividends)
					},
					{
						label: 'Reversement → Filiale',
						data: results.map((r) => r.holdingToSubsidiary)
					}
				]
			},
			capitals: {
				labels,
				datasets: [
					{
						label: 'Capital Filiale',
						data: results.map((r) => r.subsidiaryCapital)
					},
					{
						label: 'Capital Holding',
						data: results.map((r) => r.holdingCapital)
					}
				]
			}
		};
	});
</script>

<section class="mb-8 sm:mb-12">
	<h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 border-b-2 border-black pb-3">Visualisations</h2>
	<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
		<div class="border-2 border-gray-300 bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
			<LineChart
				title="Évolution des Résultats"
				labels={chartData.results.labels}
				datasets={chartData.results.datasets}
			/>
		</div>
		<div class="border-2 border-gray-300 bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
			<LineChart
				title="Recettes et Charges"
				labels={chartData.revenuesCharges.labels}
				datasets={chartData.revenuesCharges.datasets}
			/>
		</div>
		<div class="border-2 border-gray-300 bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
			<LineChart
				title="Dividendes et Reversements"
				labels={chartData.dividends.labels}
				datasets={chartData.dividends.datasets}
			/>
		</div>
		<div class="border-2 border-gray-300 bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
			<LineChart
				title="Évolution des Capitaux"
				labels={chartData.capitals.labels}
				datasets={chartData.capitals.datasets}
			/>
		</div>
	</div>
</section>

