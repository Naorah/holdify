<!--
	Composant d'affichage du tableau de résultats
-->

<script lang="ts">
	import { formatCurrency } from '$lib/utils/formatters';
	import { exportToCSV, downloadCSV } from '$lib/services/export.service';
	import type { MonthlyResult } from '$lib/types/simulation.types';

	interface Props {
		results: MonthlyResult[];
	}

	let { results }: Props = $props();

	function handleExportCSV() {
		if (results.length === 0) return;
		const csv = exportToCSV(results);
		downloadCSV(csv);
	}
</script>

<section class="border-2 border-gray-300 bg-white p-6 md:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 mb-8 sm:mb-12">
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
		<h2 class="text-2xl md:text-3xl font-bold mb-6 md:mb-8 border-b-2 border-black pb-3 mb-0">Détail Mensuel</h2>
		<button type="button" class="px-6 py-3 font-semibold transition-all duration-300 border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg whitespace-nowrap" onclick={handleExportCSV}>
			Exporter en CSV
		</button>
	</div>

	<div class="overflow-x-auto -mx-4 sm:mx-0 lg:-mx-2">
		<div class="inline-block min-w-full align-middle">
			<table class="min-w-full border-collapse pdf-table">
				<thead>
					<tr class="border-b-2 border-black">
						<th class="text-left p-3 sm:p-4 font-semibold text-sm sm:text-base bg-gray-100 border-r-2 border-gray-400">Mois</th>
						<th class="text-center p-3 sm:p-4 font-semibold text-sm sm:text-base bg-blue-50 border-r-2 border-gray-400" colspan="3">Holding</th>
						<th class="text-center p-3 sm:p-4 font-semibold text-sm sm:text-base bg-green-50 border-r-2 border-gray-400" colspan="3">Filiale</th>
						<th class="text-center p-3 sm:p-4 font-semibold text-sm sm:text-base bg-yellow-50 border-r-2 border-gray-400" colspan="4">Résultats</th>
						<th class="text-center p-3 sm:p-4 font-semibold text-sm sm:text-base bg-purple-50" colspan="2">Capitaux</th>
					</tr>
					<tr class="border-b-2 border-black">
						<th class="text-left p-3 sm:p-4 font-semibold text-xs bg-gray-100 border-r-2 border-gray-400">Mois</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-blue-50 border-r border-gray-300">Recettes</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-blue-50 border-r border-gray-300">Charges</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-blue-50 border-r-2 border-gray-400">Résultat</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-green-50 border-r border-gray-300">Recettes</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-green-50 border-r border-gray-300">Charges</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-green-50 border-r-2 border-gray-400">Résultat</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-yellow-50 border-r border-gray-300">Bénéfice</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-yellow-50 border-r border-gray-300">IS</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-yellow-50 border-r border-gray-300">Dividende Bénéfice</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-yellow-50 border-r-2 border-gray-400">Dividendes Actionnaires</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-purple-50 border-r border-gray-300">Capital Filiale</th>
						<th class="text-right p-3 sm:p-4 font-semibold text-xs bg-purple-50">Capital Holding</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-300">
					{#each results as result (result.month)}
						<tr class="border-b border-gray-300 hover:bg-gray-50 transition-colors duration-150">
							<td class="p-3 sm:p-4 font-medium bg-gray-50 border-r-2 border-gray-400">{result.month}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-blue-50/30 border-r border-gray-300">{formatCurrency(result.revenueHolding)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-blue-50/30 border-r border-gray-300">{formatCurrency(result.chargesHolding)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-blue-50/30 border-r-2 border-gray-400 font-medium">{formatCurrency(result.resultHolding)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-green-50/30 border-r border-gray-300">{formatCurrency(result.revenueSubsidiary)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-green-50/30 border-r border-gray-300">{formatCurrency(result.chargesSubsidiary)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-green-50/30 border-r-2 border-gray-400 font-medium">{formatCurrency(result.resultSubsidiary)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-yellow-50/30 border-r border-gray-300 font-medium">{formatCurrency(result.profitHolding)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-yellow-50/30 border-r border-gray-300">{formatCurrency(result.isAmount)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-yellow-50/30 border-r border-gray-300">{formatCurrency(result.dividendOnProfit)}</td>
							<td class="p-3 sm:p-4 text-right text-sm sm:text-base bg-yellow-50/30 border-r-2 border-gray-400">{formatCurrency(result.shareholdersDividends)}</td>
							<td class="p-3 sm:p-4 text-right font-semibold text-sm sm:text-base bg-purple-50/30 border-r border-gray-300">
								{formatCurrency(result.subsidiaryCapital)}
							</td>
							<td class="p-3 sm:p-4 text-right font-semibold text-sm sm:text-base bg-purple-50/30">
								{formatCurrency(result.holdingCapital)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

