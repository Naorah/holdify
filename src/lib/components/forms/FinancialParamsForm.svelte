<!--
	Composant de formulaire pour les paramètres financiers
-->

<script lang="ts">
	import { formatPercent } from '$lib/utils/formatters';

	interface Props {
		baseMonthlyRevenueHolding: number;
		baseMonthlyRevenueSubsidiary: number;
		baseMonthlyChargesHolding: number;
		baseMonthlyChargesSubsidiary: number;
		volatility: number;
		monthlyGrowthRate: number;
		dividendOnProfitRatio: number;
		useCapitalBasedRevenue: boolean;
		capitalRevenueRate: number;
	}

	let { 
		baseMonthlyRevenueHolding = $bindable(), 
		baseMonthlyRevenueSubsidiary = $bindable(),
		baseMonthlyChargesHolding = $bindable(),
		baseMonthlyChargesSubsidiary = $bindable(),
		volatility = $bindable(), 
		monthlyGrowthRate = $bindable(),
		dividendOnProfitRatio = $bindable(),
		useCapitalBasedRevenue = $bindable(),
		capitalRevenueRate = $bindable()
	}: Props = $props();
</script>

<div class="space-y-5 p-4 rounded-lg bg-gray-50 border border-gray-300">
	<h3 class="text-lg md:text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Paramètres Financiers</h3>

	<div>
		<label class="flex items-center gap-2 mb-2">
			<input
				type="checkbox"
				bind:checked={useCapitalBasedRevenue}
				class="w-4 h-4 border-2 border-gray-300 rounded focus:ring-2 focus:ring-black"
			/>
			<span class="text-sm font-medium">Calculer les recettes basé sur le capital</span>
		</label>
		{#if useCapitalBasedRevenue}
			<div class="ml-6 mb-4">
				<label for="capitalRevenueRate" class="block text-sm font-medium mb-2">
					Taux de recette mensuel sur capital ({formatPercent(capitalRevenueRate)})
				</label>
				<input
					id="capitalRevenueRate"
					type="range"
					class="w-full"
					bind:value={capitalRevenueRate}
					min="0"
					max="1"
					step="0.001"
				/>
				<p class="text-xs text-gray-600 mt-1">
					Pourcentage mensuel du capital généré en recettes (ex: 1% = 0.01)
				</p>
			</div>
		{:else}
			<div>
				<label for="revenueHolding" class="block text-sm font-medium mb-1">
					Recettes Mensuelles de Base - Holding (€)
				</label>
				<input
					id="revenueHolding"
					type="number"
					class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
					bind:value={baseMonthlyRevenueHolding}
					min="0"
					step="100"
					required
				/>
			</div>
		{/if}
	</div>

	<div>
		<label for="chargesHolding" class="block text-sm font-medium mb-1">
			Charges Mensuelles de Base - Holding (€)
		</label>
		<input
			id="chargesHolding"
			type="number"
			class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
			bind:value={baseMonthlyChargesHolding}
			min="0"
			step="100"
			required
		/>
	</div>

	<div>
		<label for="revenueSubsidiary" class="block text-sm font-medium mb-1">
			Recettes Mensuelles de Base - Filiale (€)
		</label>
		<input
			id="revenueSubsidiary"
			type="number"
			class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
			bind:value={baseMonthlyRevenueSubsidiary}
			min="0"
			step="100"
			required
		/>
	</div>

	<div>
		<label for="chargesSubsidiary" class="block text-sm font-medium mb-1">
			Charges Mensuelles de Base - Filiale (€)
		</label>
		<input
			id="chargesSubsidiary"
			type="number"
			class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
			bind:value={baseMonthlyChargesSubsidiary}
			min="0"
			step="100"
			required
		/>
	</div>

	<div>
		<label for="dividendRatio" class="block text-sm font-medium mb-2">
			Ratio Dividende sur Bénéfice ({formatPercent(dividendOnProfitRatio)})
		</label>
		<input
			id="dividendRatio"
			type="range"
			class="w-full"
			bind:value={dividendOnProfitRatio}
			min="0"
			max="0.2"
			step="0.01"
		/>
		<p class="text-xs text-gray-600 mt-1">
			Pourcentage du bénéfice prélevé en dividende (défaut: 5%)
		</p>
	</div>

	<div>
		<label for="volatility" class="block text-sm font-medium mb-2">
			Volatilité ({formatPercent(volatility)})
		</label>
		<input
			id="volatility"
			type="range"
			class="w-full"
			bind:value={volatility}
			min="0"
			max="0.5"
			step="0.01"
		/>
	</div>

	<div>
		<label for="growthRate" class="block text-sm font-medium mb-2">
			Taux de Croissance Mensuel ({formatPercent(monthlyGrowthRate)})
		</label>
		<input
			id="growthRate"
			type="range"
			class="w-full"
			bind:value={monthlyGrowthRate}
			min="0"
			max="0.1"
			step="0.001"
		/>
	</div>
</div>

