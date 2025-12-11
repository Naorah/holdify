<!--
	Composant de formulaire pour la politique de reversement
-->

<script lang="ts">
	import { formatPercent } from '$lib/utils/formatters';
	import type { ReversalTier } from '$lib/types/simulation.types';

	interface Props {
		reversalPolicyType: 'none' | 'pct_of_holding' | 'conditional' | 'tiered';
		reversalPercentage: number;
		reversalThreshold: number;
		reversalAmount: number;
		reversalTiers: ReversalTier[];
	}

	let {
		reversalPolicyType = $bindable(),
		reversalPercentage = $bindable(),
		reversalThreshold = $bindable(),
		reversalAmount = $bindable(),
		reversalTiers = $bindable()
	}: Props = $props();
</script>

<div class="space-y-5 p-4 rounded-lg bg-gray-50 border border-gray-300">
	<h3 class="text-lg md:text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Politique de Reversement</h3>

	<div>
		<label for="reversalPolicy" class="block text-sm font-medium mb-1">
			Type de Reversement
		</label>
		<select id="reversalPolicy" class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black" bind:value={reversalPolicyType}>
			<option value="none">Aucun</option>
			<option value="pct_of_holding">% du Capital Holding</option>
			<option value="conditional">Conditionnel (seuil capital)</option>
			<option value="tiered">Par Paliers (selon bénéfice)</option>
		</select>
	</div>

	{#if reversalPolicyType === 'pct_of_holding'}
		<div>
			<label for="reversalPct" class="block text-sm font-medium mb-2">
				Pourcentage ({formatPercent(reversalPercentage)})
			</label>
			<input
				id="reversalPct"
				type="range"
				class="w-full"
				bind:value={reversalPercentage}
				min="0"
				max="1"
				step="0.01"
			/>
		</div>
	{/if}

	{#if reversalPolicyType === 'conditional'}
		<div>
			<label for="reversalThreshold" class="block text-sm font-medium mb-1">
				Seuil Capital Holding (€)
			</label>
			<input
				id="reversalThreshold"
				type="number"
				class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
				bind:value={reversalThreshold}
				min="0"
				step="1000"
			/>
		</div>
		<div>
			<label for="reversalAmount" class="block text-sm font-medium mb-1">
				Montant à Reverser (€)
			</label>
			<input
				id="reversalAmount"
				type="number"
				class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
				bind:value={reversalAmount}
				min="0"
				step="1000"
			/>
		</div>
	{/if}

	{#if reversalPolicyType === 'tiered'}
		<div class="space-y-3">
			<label class="block text-sm font-medium mb-2">
				Paliers de Reversement (si bénéfice net ≥ seuil, alors reverser montant)
			</label>
			{#each reversalTiers as tier, index (index)}
				<div class="flex flex-col sm:flex-row gap-3 p-3 bg-white rounded-lg border border-gray-300">
					<div class="flex-1">
						<label for="tier-threshold-{index}" class="block text-xs font-medium mb-1">Seuil Bénéfice Net (€)</label>
						<input
							id="tier-threshold-{index}"
							type="number"
							class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black text-sm"
							bind:value={tier.profitThreshold}
							min="0"
							step="1000"
							placeholder="Seuil"
						/>
					</div>
					<div class="flex-1">
						<label for="tier-amount-{index}" class="block text-xs font-medium mb-1">Montant à Reverser (€)</label>
						<input
							id="tier-amount-{index}"
							type="number"
							class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black text-sm"
							bind:value={tier.amount}
							min="0"
							step="1000"
							placeholder="Montant"
						/>
					</div>
					<div class="flex items-end">
						<button
							type="button"
							class="px-3 py-2 text-sm font-semibold transition-all duration-300 border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
							onclick={() => {
								reversalTiers = reversalTiers.filter((_, i) => i !== index);
							}}
						>
							Supprimer
						</button>
					</div>
				</div>
			{/each}
			<button
				type="button"
				class="px-6 py-3 text-sm font-semibold transition-all duration-300 border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg w-full"
				onclick={() => {
					reversalTiers = [...reversalTiers, { profitThreshold: 0, amount: 0 }];
				}}
			>
				+ Ajouter un Palier
			</button>
		</div>
	{/if}
</div>

