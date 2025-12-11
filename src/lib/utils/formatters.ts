/**
 * Utilitaires de formatage pour l'affichage
 */

/**
 * Formate un montant en devise EUR
 * 
 * @param value Montant à formater
 * @returns Chaîne formatée (ex: "10 000,00 €")
 */
export function formatCurrency(value: number): string {
	return new Intl.NumberFormat('fr-FR', {
		style: 'currency',
		currency: 'EUR',
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	}).format(value);
}

/**
 * Formate un pourcentage
 * 
 * @param value Taux en décimal (ex: 0.1 pour 10%)
 * @returns Chaîne formatée (ex: "10.0%")
 */
export function formatPercent(value: number): string {
	return `${(value * 100).toFixed(1)}%`;
}

/**
 * Formate un nombre avec séparateur de milliers
 * 
 * @param value Nombre à formater
 * @param decimals Nombre de décimales
 * @returns Chaîne formatée
 */
export function formatNumber(value: number, decimals: number = 0): string {
	return new Intl.NumberFormat('fr-FR', {
		minimumFractionDigits: decimals,
		maximumFractionDigits: decimals
	}).format(value);
}

