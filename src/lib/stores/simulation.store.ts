/**
 * Store de gestion de l'état de la simulation
 * 
 * Note: Les runes $state ne peuvent être utilisées que dans des fichiers .svelte
 * Ce store utilise des classes simples qui seront rendues réactives via $state dans les composants
 */

import type { MonthlyResult } from '../types/simulation.types';

/**
 * État de la simulation
 * 
 * Cette classe contient les résultats de simulation et les méthodes pour les manipuler.
 * Les propriétés seront rendues réactives via $state dans les composants qui l'utilisent.
 */
export class SimulationStore {
	/** Résultats de la simulation */
	results: MonthlyResult[] = [];
	
	/** Indique si une simulation a été exécutée */
	hasRunSimulation = false;

	/**
	 * Définit les résultats de la simulation
	 */
	setResults(results: MonthlyResult[]): void {
		this.results = results;
		this.hasRunSimulation = true;
	}

	/**
	 * Réinitialise l'état de la simulation
	 */
	reset(): void {
		this.results = [];
		this.hasRunSimulation = false;
	}

	/**
	 * Données formatées pour les graphiques
	 */
	getChartData() {
		if (this.results.length === 0) {
			return {
				profits: { labels: [], datasets: [] },
				dividends: { labels: [], datasets: [] },
				capitals: { labels: [], datasets: [] }
			};
		}

		const labels = this.results.map((r) => `Mois ${r.month}`);

		return {
			profits: {
				labels,
				datasets: [
					{
						label: 'Profit Brut Holding',
						data: this.results.map((r) => r.profitGross)
					},
					{
						label: 'Profit Net Holding',
						data: this.results.map((r) => r.profitNet)
					}
				]
			},
			dividends: {
				labels,
				datasets: [
					{
						label: 'Dividendes Actionnaires',
						data: this.results.map((r) => r.shareholdersDividends)
					},
					{
						label: 'Reversement → Filiale',
						data: this.results.map((r) => r.holdingToSubsidiary)
					}
				]
			},
			capitals: {
				labels,
				datasets: [
					{
						label: 'Capital Filiale',
						data: this.results.map((r) => r.subsidiaryCapital)
					},
					{
						label: 'Capital Holding',
						data: this.results.map((r) => r.holdingCapital)
					}
				]
			}
		};
	}
}

// Export d'une instance singleton
export const simulationStore = new SimulationStore();
