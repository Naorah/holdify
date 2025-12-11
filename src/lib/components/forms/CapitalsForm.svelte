<!--
	Composant de formulaire pour les capitaux
-->

<script lang="ts">
	interface Props {
		initialSubsidiaryCapital: number;
		durationMonths: number;
	}

	let { initialSubsidiaryCapital = $bindable(), durationMonths = $bindable() }: Props = $props();
</script>

<div class="space-y-5 p-4 rounded-lg bg-gray-50 border border-gray-300">
	<h3 class="text-lg md:text-xl font-semibold border-b border-gray-300 pb-2 mb-4">Capitaux</h3>

	<div>
		<label for="subsidiaryCapital" class="block text-sm font-medium mb-1">
			Capital Initial Filiale (€)
		</label>
		<input
			id="subsidiaryCapital"
			type="number"
			class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
			bind:value={initialSubsidiaryCapital}
			min="0"
			step="1000"
			required
		/>
		<p class="text-xs text-gray-600 mt-1">
			Le capital de la holding provient des investissements des actionnaires
		</p>
	</div>

	<div>
		<label for="duration" class="block text-sm font-medium mb-1">
			Durée (mois)
		</label>
		<input
			id="duration"
			type="number"
			class="w-full px-4 py-3 border-2 border-gray-300 bg-white text-black rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-black focus:border-black hover:border-black"
			bind:value={durationMonths}
			min="1"
			max="120"
			required
		/>
	</div>
</div>

