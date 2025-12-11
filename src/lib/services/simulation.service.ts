/**
 * Service de simulation économique
 * 
 * Contient toute la logique de calcul pour la simulation
 * (déplacé depuis simulator.ts pour séparer la logique)
 */

import type {
	SimulationParameters,
	MonthlyResult,
	TaxBracket,
	TaxParameters,
	ReversalPolicy,
	ReversalTier,
	Shareholder
} from '../types/simulation.types';

// ============================================================================
// VALEURS PAR DÉFAUT
// ============================================================================

/**
 * Barème IS par défaut (taux indicatifs - À VÉRIFIER)
 */
export const DEFAULT_IS_BRACKETS: TaxBracket[] = [
	{ threshold: 0, rate: 0.15 },
	{ threshold: 42500, rate: 0.25 },
	{ threshold: 500000, rate: 0.28 },
	{ threshold: 5000000, rate: 0.31 }
];

/**
 * Paramètres fiscaux par défaut
 */
export const DEFAULT_TAX_PARAMS: TaxParameters = {
	isBrackets: DEFAULT_IS_BRACKETS,
	dividendIrRate: 0.128,
	dividendSocialRate: 0.172
};

// ============================================================================
// CALCULS FISCAUX
// ============================================================================

/**
 * Calcule l'IS (Impôt sur les Sociétés) selon un barème progressif
 */
export function calculateIS(profit: number, brackets: TaxBracket[]): number {
	if (profit <= 0) return 0;

	let tax = 0;
	let remainingProfit = profit;

	const sortedBrackets = [...brackets].sort((a, b) => a.threshold - b.threshold);

	for (let i = 0; i < sortedBrackets.length; i++) {
		const bracket = sortedBrackets[i];
		const nextBracket = sortedBrackets[i + 1];

		if (remainingProfit <= bracket.threshold) break;

		const taxableInBracket = nextBracket
			? Math.min(remainingProfit - bracket.threshold, nextBracket.threshold - bracket.threshold)
			: remainingProfit - bracket.threshold;

		tax += taxableInBracket * bracket.rate;
	}

	return Math.round(tax * 100) / 100;
}

/**
 * Calcule le PFU (Prélèvement Forfaitaire Unique) sur les dividendes
 */
export function calculatePFU(dividend: number, irRate: number, socialRate: number): number {
	if (dividend <= 0) return 0;
	const totalRate = irRate + socialRate;
	return Math.round(dividend * totalRate * 100) / 100;
}

/**
 * Calcule le montant reçu après PFU
 */
export function calculateHoldingReceived(dividend: number, pfu: number): number {
	return Math.round((dividend - pfu) * 100) / 100;
}

// ============================================================================
// CALCULS DE REVERSEMENT
// ============================================================================

/**
 * Calcule le reversement de la holding vers la filiale selon la politique
 */
export function calculateReversal(
	policy: ReversalPolicy,
	holdingCapital: number,
	profitNet: number
): number {
	switch (policy.type) {
		case 'none':
			return 0;
		case 'pct_of_holding':
			return Math.round(holdingCapital * policy.percentage * 100) / 100;
		case 'conditional':
			if (holdingCapital >= policy.threshold) {
				return policy.amount;
			}
			return 0;
		case 'tiered':
			const sortedTiers = [...policy.tiers].sort((a, b) => b.profitThreshold - a.profitThreshold);
			for (const tier of sortedTiers) {
				if (profitNet >= tier.profitThreshold) {
					return tier.amount;
				}
			}
			return 0;
		default:
			return 0;
	}
}

// ============================================================================
// CALCULS ACTIONNAIRES
// ============================================================================

/**
 * Calcule les dividendes versés aux actionnaires depuis la holding
 * 
 * Deux modes de rémunération sont supportés :
 * - 'on_profit' : %age mensuel directement sur le profit net (réparti proportionnellement à l'investissement)
 * - 'on_investment' : %age annuel sur l'investissement de base (divisé par 12 pour obtenir le montant mensuel)
 */
export function calculateShareholdersDividends(
	shareholders: Shareholder[],
	profitNet: number
): number {
	if (shareholders.length === 0) return 0;

	let totalDividends = 0;
	for (const shareholder of shareholders) {
		let shareholderDividend = 0;

		if (shareholder.remunerationMode === 'on_profit') {
			// Mode : %age mensuel sur les bénéfices
			// Le taux est appliqué directement au profit net mensuel
			// Répartition proportionnelle selon l'investissement
			const totalInvestment = shareholders.reduce((sum, sh) => sum + sh.investment, 0);
			if (totalInvestment > 0) {
				const investmentRatio = shareholder.investment / totalInvestment;
				// Taux appliqué directement au profit net (pas divisé par 12)
				shareholderDividend = profitNet * investmentRatio * shareholder.dividendRate;
			}
		} else {
			// Mode : %age annuel sur l'investissement de base
			// Le taux annuel est divisé par 12 pour obtenir le montant mensuel
			const monthlyRate = shareholder.dividendRate / 12;
			shareholderDividend = shareholder.investment * monthlyRate;
		}

		totalDividends += shareholderDividend;
	}

	return Math.round(totalDividends * 100) / 100;
}

// ============================================================================
// GÉNÉRATION DE RECETTES ET CHARGES
// ============================================================================

/**
 * Génère une valeur mensuelle avec volatilité et croissance
 */
function generateMonthlyValue(
	baseValue: number,
	volatility: number,
	growthRate: number,
	month: number
): number {
	const growthFactor = Math.pow(1 + growthRate, month - 1);
	const expectedValue = baseValue * growthFactor;

	// Simulation de volatilité (approximation normale)
	const u1 = Math.random();
	const u2 = Math.random();
	const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);

	const volatilityFactor = 1 + z * volatility;
	const value = expectedValue * volatilityFactor;

	return Math.max(0, Math.round(value * 100) / 100);
}

// ============================================================================
// SIMULATION PRINCIPALE
// ============================================================================

/**
 * Exécute la simulation complète mois par mois
 * 
 * La holding et la filiale génèrent des recettes et ont des charges.
 * Résultat = Recettes - Charges
 * Si résultat > 0, c'est un bénéfice
 * Sur le bénéfice, on peut prélever un dividende selon un ratio (5% par défaut)
 */
export function runSimulation(params: SimulationParameters): MonthlyResult[] {
	const results: MonthlyResult[] = [];
	let subsidiaryCapital = params.initialSubsidiaryCapital;
	let holdingCapital = params.initialHoldingCapital;

	// Ajouter les investissements des actionnaires au capital initial de la holding
	const totalShareholderInvestment = params.shareholders.reduce((sum, sh) => sum + sh.investment, 0);
	holdingCapital += totalShareholderInvestment;

	for (let month = 1; month <= params.durationMonths; month++) {
		// 1. Génération des recettes et charges pour la holding
		let revenueHolding: number;
		if (params.useCapitalBasedRevenue) {
			// Calcul des recettes basé sur le capital actuel de la holding
			const capitalBasedRevenue = holdingCapital * params.capitalRevenueRate;
			// Appliquer volatilité et croissance
			revenueHolding = generateMonthlyValue(
				capitalBasedRevenue,
				params.volatility,
				params.monthlyGrowthRate,
				month
			);
		} else {
			// Calcul classique avec valeur de base
			revenueHolding = generateMonthlyValue(
				params.baseMonthlyRevenueHolding,
				params.volatility,
				params.monthlyGrowthRate,
				month
			);
		}
		const chargesHolding = generateMonthlyValue(
			params.baseMonthlyChargesHolding,
			params.volatility,
			params.monthlyGrowthRate,
			month
		);

		// 2. Génération des recettes et charges pour la filiale
		const revenueSubsidiary = generateMonthlyValue(
			params.baseMonthlyRevenueSubsidiary,
			params.volatility,
			params.monthlyGrowthRate,
			month
		);
		const chargesSubsidiary = generateMonthlyValue(
			params.baseMonthlyChargesSubsidiary,
			params.volatility,
			params.monthlyGrowthRate,
			month
		);

		// 3. Calcul des résultats (recettes - charges)
		const resultHolding = revenueHolding - chargesHolding;
		const resultSubsidiary = revenueSubsidiary - chargesSubsidiary;

		// 4. Bénéfice de la holding (résultat > 0)
		const profitHolding = Math.max(0, resultHolding);

		// 5. Calcul de l'IS payé par la holding sur le bénéfice
		const isAmount = calculateIS(profitHolding, params.taxParams.isBrackets);

		// 6. Profit net de la holding après IS
		const profitNet = profitHolding - isAmount;

		// 7. Dividende sur bénéfice (ratio du bénéfice, ex: 5%)
		const dividendOnProfit = profitNet > 0 ? Math.round(profitNet * params.dividendOnProfitRatio * 100) / 100 : 0;

		// 8. Calcul des dividendes versés aux actionnaires (depuis le profit net après dividende sur bénéfice)
		const profitAfterDividendOnProfit = profitNet - dividendOnProfit;
		const shareholdersDividends = calculateShareholdersDividends(
			params.shareholders,
			profitAfterDividendOnProfit
		);

		// 9. Reversement holding → filiale
		const holdingToSubsidiary = calculateReversal(
			params.reversalPolicy,
			holdingCapital,
			profitNet
		);

		// 10. Mise à jour des capitaux
		// Filiale : capital + résultat + reversement
		subsidiaryCapital = subsidiaryCapital + resultSubsidiary + holdingToSubsidiary;
		// Holding : capital + résultat - IS - dividende sur bénéfice - dividendes actionnaires - reversement
		holdingCapital = holdingCapital + resultHolding - isAmount - dividendOnProfit - shareholdersDividends - holdingToSubsidiary;

		// Arrondi des capitaux
		subsidiaryCapital = Math.round(subsidiaryCapital * 100) / 100;
		holdingCapital = Math.round(holdingCapital * 100) / 100;

		results.push({
			month,
			revenueHolding,
			chargesHolding,
			resultHolding,
			revenueSubsidiary,
			chargesSubsidiary,
			resultSubsidiary,
			profitHolding,
			isAmount,
			profitNet,
			dividendOnProfit,
			shareholdersDividends,
			holdingToSubsidiary,
			subsidiaryCapital,
			holdingCapital
		});
	}

	return results;
}

