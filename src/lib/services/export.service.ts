/**
 * Service d'export de données
 * 
 * Gère l'export CSV et PDF des résultats de simulation
 */

import type { MonthlyResult } from '../types/simulation.types';

/**
 * Convertit les résultats de simulation en format CSV
 */
export function exportToCSV(results: MonthlyResult[]): string {
	const headers = [
		'Mois',
		'Recettes Holding',
		'Charges Holding',
		'Résultat Holding',
		'Recettes Filiale',
		'Charges Filiale',
		'Résultat Filiale',
		'Bénéfice Holding',
		'IS Payé',
		'Profit Net Holding',
		'Dividende sur Bénéfice',
		'Dividendes Actionnaires',
		'Reversement Holding→Filiale',
		'Capital Filiale',
		'Capital Holding'
	];

	const rows = results.map((r) => [
		r.month.toString(),
		r.revenueHolding.toFixed(2),
		r.chargesHolding.toFixed(2),
		r.resultHolding.toFixed(2),
		r.revenueSubsidiary.toFixed(2),
		r.chargesSubsidiary.toFixed(2),
		r.resultSubsidiary.toFixed(2),
		r.profitHolding.toFixed(2),
		r.isAmount.toFixed(2),
		r.profitNet.toFixed(2),
		r.dividendOnProfit.toFixed(2),
		r.shareholdersDividends.toFixed(2),
		r.holdingToSubsidiary.toFixed(2),
		r.subsidiaryCapital.toFixed(2),
		r.holdingCapital.toFixed(2)
	]);

	const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

	return csvContent;
}

/**
 * Télécharge un fichier CSV
 */
export function downloadCSV(csvContent: string, filename: string = 'simulation_holdify'): void {
	const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
	const link = document.createElement('a');
	const url = URL.createObjectURL(blob);
	link.setAttribute('href', url);
	link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
	link.style.visibility = 'hidden';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

