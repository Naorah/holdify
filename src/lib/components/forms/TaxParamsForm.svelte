<!--
	Composant de formulaire pour les paramètres fiscaux
-->

<script lang="ts">
	import { formatPercent } from '$lib/utils/formatters';
	import { DEFAULT_TAX_PARAMS } from '$lib/services/simulation.service';

	interface Props {
		isBracket1Threshold: number;
		isBracket1Rate: number;
		isBracket2Threshold: number;
		isBracket2Rate: number;
		isBracket3Threshold: number;
		isBracket3Rate: number;
		dividendIrRate: number;
		dividendSocialRate: number;
		resetTaxParams?: () => void;
	}

	let {
		isBracket1Threshold = $bindable(),
		isBracket1Rate = $bindable(),
		isBracket2Threshold = $bindable(),
		isBracket2Rate = $bindable(),
		isBracket3Threshold = $bindable(),
		isBracket3Rate = $bindable(),
		dividendIrRate = $bindable(),
		dividendSocialRate = $bindable(),
		resetTaxParams: resetTaxParamsHandler
	}: Props = $props();

	function resetTaxParams() {
		if (resetTaxParamsHandler) {
			resetTaxParamsHandler();
		} else {
			// Fallback si la fonction n'est pas fournie
			isBracket1Threshold = 0;
			isBracket1Rate = DEFAULT_TAX_PARAMS.isBrackets[0]?.rate || 0.15;
			isBracket2Threshold = DEFAULT_TAX_PARAMS.isBrackets[1]?.threshold || 42500;
			isBracket2Rate = DEFAULT_TAX_PARAMS.isBrackets[1]?.rate || 0.25;
			isBracket3Threshold = DEFAULT_TAX_PARAMS.isBrackets[2]?.threshold || 500000;
			isBracket3Rate = DEFAULT_TAX_PARAMS.isBrackets[2]?.rate || 0.28;
			dividendIrRate = DEFAULT_TAX_PARAMS.dividendIrRate;
			dividendSocialRate = DEFAULT_TAX_PARAMS.dividendSocialRate;
		}
	}
</script>

<div class="space-y-5 p-4 rounded-lg bg-gray-50 border border-gray-300 md:col-span-2 lg:col-span-3">
	<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
		<h3 class="text-lg md:text-xl font-semibold border-b border-gray-300 pb-2 mb-0">Paramètres Fiscaux (IS de la Holding)</h3>
		<button type="button" class="px-4 py-2 text-sm font-semibold transition-all duration-300 border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg whitespace-nowrap" onclick={resetTaxParams}>
			Réinitialiser aux valeurs par défaut
		</button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
		<div>
			<label for="isBracket1Threshold" class="block text-sm font-medium mb-1">IS Tranche 1 - Seuil (€)</label>
			<input id="isBracket1Threshold" type="number" class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black" bind:value={isBracket1Threshold} min="0" />
		</div>
		<div>
			<label for="isBracket1Rate" class="block text-sm font-medium mb-1">IS Tranche 1 - Taux</label>
			<input
				id="isBracket1Rate"
				type="number"
				class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
				bind:value={isBracket1Rate}
				min="0"
				max="1"
				step="0.01"
			/>
		</div>
		<div>
			<label for="isBracket2Threshold" class="block text-sm font-medium mb-1">IS Tranche 2 - Seuil (€)</label>
			<input id="isBracket2Threshold" type="number" class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black" bind:value={isBracket2Threshold} min="0" />
		</div>
		<div>
			<label for="isBracket2Rate" class="block text-sm font-medium mb-1">IS Tranche 2 - Taux</label>
			<input
				id="isBracket2Rate"
				type="number"
				class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
				bind:value={isBracket2Rate}
				min="0"
				max="1"
				step="0.01"
			/>
		</div>
		<div>
			<label for="isBracket3Threshold" class="block text-sm font-medium mb-1">IS Tranche 3 - Seuil (€)</label>
			<input id="isBracket3Threshold" type="number" class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black" bind:value={isBracket3Threshold} min="0" />
		</div>
		<div>
			<label for="isBracket3Rate" class="block text-sm font-medium mb-1">IS Tranche 3 - Taux</label>
			<input
				id="isBracket3Rate"
				type="number"
				class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
				bind:value={isBracket3Rate}
				min="0"
				max="1"
				step="0.01"
			/>
		</div>
	</div>
	<p class="text-xs text-gray-600 mt-2">
		Note : Les dividendes versés aux actionnaires sont calculés directement depuis le profit net de la holding (après IS).
		Les taux PFU ne sont plus utilisés dans ce modèle.
	</p>
</div>

