<!--
	Composant de formulaire pour les paramètres d'actionnaires
-->

<script lang="ts">
	import { formatPercent } from '$lib/utils/formatters';
	import type { Shareholder, ShareholderRemunerationMode } from '$lib/types/simulation.types';

	interface Props {
		shareholders: Shareholder[];
	}

	let { shareholders = $bindable() }: Props = $props();
</script>

<div class="space-y-5 p-4 rounded-lg bg-gray-50 border border-gray-300 md:col-span-2 lg:col-span-3">
	<h3 class="text-lg md:text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Paramètres Actionnaires</h3>
	<div class="text-sm text-gray-600 mb-4">
		<p class="mb-2">Configurez les actionnaires de la holding et leurs dividendes. Choisissez le mode de rémunération :</p>
		<ul class="list-disc list-inside mt-2 space-y-1">
			<li><strong>% sur les bénéfices</strong> : Le dividende mensuel = (Profit Net × % du taux) × (Investissement / Total investissements). Le taux est appliqué mensuellement au profit net.</li>
			<li><strong>% annuel sur l'investissement</strong> : Le dividende mensuel = (Investissement × Taux annuel) / 12. Exemple : 5% annuel sur 100 000€ = 416,67€/mois.</li>
		</ul>
	</div>
	<div class="space-y-3">
		{#each shareholders as shareholder, index (index)}
							<div class="flex flex-col gap-3 p-4 bg-white rounded-lg border border-gray-300">
								<div class="flex flex-col sm:flex-row gap-3">
									<div class="flex-1">
										<label for="shareholder-name-{index}" class="block text-xs font-medium mb-1">Nom</label>
										<input
											id="shareholder-name-{index}"
											type="text"
											class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black text-sm"
											bind:value={shareholder.name}
											placeholder="Nom de l'actionnaire"
										/>
									</div>
									<div class="flex-1">
										<label for="shareholder-investment-{index}" class="block text-xs font-medium mb-1">Investissement (€)</label>
										<input
											id="shareholder-investment-{index}"
											type="number"
											class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black text-sm"
											bind:value={shareholder.investment}
											min="0"
											step="1000"
											placeholder="Montant investi"
										/>
									</div>
									<div class="flex items-end">
										<button
											type="button"
											class="px-3 py-2 text-sm font-semibold transition-all duration-300 border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
											onclick={() => {
												shareholders = shareholders.filter((_, i) => i !== index);
											}}
										>
											Supprimer
										</button>
									</div>
								</div>
								<div class="flex flex-col sm:flex-row gap-3">
									<div class="flex-1">
										<label for="shareholder-mode-{index}" class="block text-xs font-medium mb-1">Mode de Rémunération</label>
										<select
											id="shareholder-mode-{index}"
											class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black text-sm"
											bind:value={shareholder.remunerationMode}
										>
											<option value="on_profit">% annuel sur les bénéfices</option>
											<option value="on_investment">% annuel sur l'investissement</option>
										</select>
									</div>
									<div class="flex-1">
										<label for="shareholder-rate-{index}" class="block text-xs font-medium mb-1">
											Taux Dividende Annuel ({formatPercent(shareholder.dividendRate)})
										</label>
										<input
											id="shareholder-rate-{index}"
											type="range"
											class="w-full"
											bind:value={shareholder.dividendRate}
											min="0"
											max="0.2"
											step="0.001"
										/>
									</div>
								</div>
							</div>
		{/each}
						<button
							type="button"
							class="px-6 py-3 text-sm font-semibold transition-all duration-300 border-2 border-black bg-white text-black hover:bg-black hover:text-white hover:shadow-lg active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:opacity-50 disabled:cursor-not-allowed rounded-lg w-full"
							onclick={() => {
								shareholders = [...shareholders, { name: '', investment: 0, dividendRate: 0.05, remunerationMode: 'on_profit' }];
							}}
						>
							+ Ajouter un Actionnaire
						</button>
	</div>
</div>

