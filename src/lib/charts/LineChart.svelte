<!--
	Composant wrapper Chart.js pour Svelte 5
	Utilise les runes ($state, $effect, $derived) pour une réactivité optimale
	
	Ce composant crée et met à jour une instance Chart.js de type line chart
	et réagit automatiquement aux changements de props (datasets, labels).
-->

<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import {
		Chart,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		LineController,
		Title,
		Tooltip,
		Legend,
		type ChartConfiguration
	} from 'chart.js';

	// Enregistrement des composants Chart.js nécessaires
	Chart.register(
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		LineController,
		Title,
		Tooltip,
		Legend
	);

	interface Props {
		/** Labels pour l'axe X (mois, dates, etc.) */
		labels: string[] | number[];
		/** Datasets à afficher (chaque dataset = une ligne) */
		datasets: Array<{
			label: string;
			data: number[];
			borderColor?: string;
			backgroundColor?: string;
		}>;
		/** Titre du graphique */
		title?: string;
		/** Couleur de fond du graphique */
		backgroundColor?: string;
	}

	let { labels = $bindable([]), datasets = $bindable([]), title = '', backgroundColor = '#ffffff' }: Props = $props();

	// Référence au canvas
	let canvasElement: HTMLCanvasElement | undefined = $state();

	// Instance Chart.js (état interne)
	let chartInstance: Chart | null = $state(null);

	// Configuration du graphique avec thème monochrome
	const getChartConfig = (): ChartConfiguration<'line'> => {
		// Couleurs par défaut pour le thème noir/blanc
		const defaultColors = ['#000000', '#666666', '#333333', '#999999'];

		return {
			type: 'line',
			data: {
				labels: labels.map(String),
				datasets: datasets.map((dataset, index) => ({
					label: dataset.label,
					data: dataset.data,
					borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
					backgroundColor: dataset.backgroundColor || 'transparent',
					borderWidth: 2,
					fill: false,
					tension: 0.1, // Lissage des courbes
					pointRadius: 3,
					pointHoverRadius: 5
				}))
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					title: {
						display: !!title,
						text: title,
						color: '#000000',
						font: {
							size: 16,
							weight: 'bold'
						}
					},
					legend: {
						display: datasets.length > 0,
						position: 'top',
						labels: {
							color: '#000000',
							usePointStyle: true,
							padding: 15
						}
					},
					tooltip: {
						backgroundColor: '#000000',
						titleColor: '#ffffff',
						bodyColor: '#ffffff',
						borderColor: '#000000',
						borderWidth: 1,
						padding: 12,
						displayColors: true
					}
				},
				scales: {
					x: {
						grid: {
							color: '#e5e5e5',
							borderColor: '#000000'
						},
						ticks: {
							color: '#000000'
						}
					},
					y: {
						grid: {
							color: '#e5e5e5',
							borderColor: '#000000'
						},
						ticks: {
							color: '#000000',
							callback: function (value) {
								// Formatage des valeurs avec séparateur de milliers
								return new Intl.NumberFormat('fr-FR', {
									maximumFractionDigits: 0
								}).format(Number(value));
							}
						}
					}
				}
			}
		};
	};

	// Création initiale du graphique quand le canvas est disponible
	$effect(() => {
		if (!canvasElement || chartInstance) return;

		const config = getChartConfig();
		chartInstance = new Chart(canvasElement, config);
	});

	// Mise à jour des données lorsque les props changent (seulement si le graphique existe)
	$effect(() => {
		// Utiliser untrack pour éviter que la lecture de chartInstance déclenche une boucle
		const instance = untrack(() => chartInstance);
		if (!instance) return;
		if (labels.length === 0 || datasets.length === 0) return;

		instance.data.labels = labels.map(String);
		instance.data.datasets = datasets.map((dataset, index) => {
			const defaultColors = ['#000000', '#666666', '#333333', '#999999'];
			return {
				label: dataset.label,
				data: dataset.data,
				borderColor: dataset.borderColor || defaultColors[index % defaultColors.length],
				backgroundColor: dataset.backgroundColor || 'transparent',
				borderWidth: 2,
				fill: false,
				tension: 0.1,
				pointRadius: 3,
				pointHoverRadius: 5
			};
		});
		instance.update('none'); // 'none' pour une mise à jour sans animation
	});

	// Cleanup lors de la destruction du composant
	onMount(() => {
		return () => {
			if (chartInstance) {
				chartInstance.destroy();
				chartInstance = null;
			}
		};
	});
</script>

<div class="chart-container" style="background-color: {backgroundColor};">
	<canvas bind:this={canvasElement}></canvas>
</div>

<style>
	.chart-container {
		position: relative;
		width: 100%;
		height: 400px;
		padding: 1rem;
		border: 1px solid #e5e5e5;
	}
</style>

