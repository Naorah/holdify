<!--
	Composant d'en-tête de l'application
-->

<script lang="ts">
	import logoH from '$lib/assets/favicon_white.png';
</script>

<header class="border-b-2 border-black bg-white shadow-md sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex flex-row items-center gap-3 sm:gap-6 py-4 sm:py-6">
			<img src={logoH} alt="Holdify Logo" class="w-12 h-12 sm:w-20 sm:h-20 flex-shrink-0" />
			<div class="flex-1 text-left min-w-0">
				<h1 class="text-xl sm:text-4xl lg:text-5xl font-bold tracking-tight truncate">Holdify</h1>
				<p class="text-gray-600 mt-1 sm:mt-2 text-xs sm:text-base truncate">Simulation Économique Holding - Filiale</p>
			</div>
		</div>
	</div>
</header>

