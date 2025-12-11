<!--
	Composant d'en-tête de l'application
-->

<script lang="ts">
	import logoH from '$lib/assets/H.svg';
</script>

<header class="border-b-2 border-black bg-white shadow-md sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 py-6">
			<img src={logoH} alt="Holdify Logo" class="w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0" />
			<div class="text-center sm:text-left">
				<h1 class="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">Holdify</h1>
				<p class="text-gray-600 mt-2 text-sm sm:text-base">Simulation Économique Holding - Filiale</p>
			</div>
		</div>
	</div>
</header>

