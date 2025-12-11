/**
 * Store de gestion de l'état du formulaire
 * 
 * Gère tous les paramètres de simulation saisis par l'utilisateur
 * 
 * Note: Les runes $state ne peuvent être utilisées que dans des fichiers .svelte
 * Ce store utilise des classes simples qui seront rendues réactives via $state dans les composants
 */

import type {
	ReversalPolicy,
	ReversalTier,
	Shareholder,
	TaxParameters,
	SimulationParameters
} from '../types/simulation.types';
import { DEFAULT_TAX_PARAMS } from '../services/simulation.service';

/**
 * État du formulaire de simulation
 * 
 * Cette classe contient les valeurs par défaut et les méthodes pour construire
 * les paramètres de simulation. Les propriétés seront rendues réactives via $state
 * dans les composants qui l'utilisent.
 */
export class FormStore {
	// Paramètres financiers - Recettes et Charges
	baseMonthlyRevenueHolding = 10000;
	baseMonthlyRevenueSubsidiary = 5000;
	baseMonthlyChargesHolding = 3000;
	baseMonthlyChargesSubsidiary = 2000;
	volatility = 0.1; // 10%
	monthlyGrowthRate = 0.02; // 2%
	
	// Capitaux
	initialSubsidiaryCapital = 0;
	initialHoldingCapital = 0;
	durationMonths = 12;
	
	// Ratio de dividende sur bénéfice
	dividendOnProfitRatio = 0.05; // 5%
	
	// Calcul des recettes basé sur le capital
	useCapitalBasedRevenue = false;
	capitalRevenueRate = 0.01; // 1% mensuel

	// Politique de reversement
	reversalPolicyType: 'none' | 'pct_of_holding' | 'conditional' | 'tiered' = 'none';
	reversalPercentage = 0.1; // 10%
	reversalThreshold = 100000;
	reversalAmount = 5000;
	reversalTiers: ReversalTier[] = [
		{ profitThreshold: 10000, amount: 2000 },
		{ profitThreshold: 20000, amount: 5000 }
	];

	// Actionnaires
	shareholders: Shareholder[] = [
		{ name: 'Actionnaire 1', investment: 50000, dividendRate: 0.05, remunerationMode: 'on_profit' }
	];

	// Paramètres fiscaux
	isBracket1Threshold = 0;
	isBracket1Rate = 0.15;
	isBracket2Threshold = 42500;
	isBracket2Rate = 0.25;
	isBracket3Threshold = 500000;
	isBracket3Rate = 0.28;
	dividendIrRate = 0.128; // 12.8%
	dividendSocialRate = 0.172; // 17.2%

	/**
	 * Calcule la politique de reversement à partir de l'état
	 */
	getReversalPolicy(): ReversalPolicy {
		switch (this.reversalPolicyType) {
			case 'pct_of_holding':
				return { type: 'pct_of_holding', percentage: this.reversalPercentage };
			case 'conditional':
				return {
					type: 'conditional',
					threshold: this.reversalThreshold,
					amount: this.reversalAmount
				};
			case 'tiered':
				return {
					type: 'tiered',
					tiers: this.reversalTiers.filter(t => t.profitThreshold > 0 && t.amount > 0)
				};
			default:
				return { type: 'none' };
		}
	}

	/**
	 * Calcule les paramètres fiscaux à partir de l'état
	 */
	getTaxParams(): TaxParameters {
		return {
			isBrackets: [
				{ threshold: this.isBracket1Threshold, rate: this.isBracket1Rate },
				{ threshold: this.isBracket2Threshold, rate: this.isBracket2Rate },
				{ threshold: this.isBracket3Threshold, rate: this.isBracket3Rate }
			],
			dividendIrRate: this.dividendIrRate,
			dividendSocialRate: this.dividendSocialRate
		};
	}

	/**
	 * Construit les paramètres de simulation complets
	 */
	getSimulationParameters(): SimulationParameters {
		return {
			baseMonthlyRevenueHolding: this.baseMonthlyRevenueHolding,
			baseMonthlyRevenueSubsidiary: this.baseMonthlyRevenueSubsidiary,
			baseMonthlyChargesHolding: this.baseMonthlyChargesHolding,
			baseMonthlyChargesSubsidiary: this.baseMonthlyChargesSubsidiary,
			volatility: this.volatility,
			monthlyGrowthRate: this.monthlyGrowthRate,
			dividendPayoutRatio: 0, // Non utilisé dans le nouveau modèle
			initialSubsidiaryCapital: this.initialSubsidiaryCapital,
			initialHoldingCapital: this.initialHoldingCapital,
			reversalPolicy: this.getReversalPolicy(),
			durationMonths: this.durationMonths,
			taxParams: this.getTaxParams(),
			shareholders: this.shareholders.filter(sh => sh.name.trim() !== '' && sh.investment > 0),
			dividendOnProfitRatio: this.dividendOnProfitRatio,
			useCapitalBasedRevenue: this.useCapitalBasedRevenue,
			capitalRevenueRate: this.capitalRevenueRate
		};
	}

	/**
	 * Réinitialise les paramètres fiscaux aux valeurs par défaut
	 */
	resetTaxParams(): void {
		this.isBracket1Threshold = 0;
		this.isBracket1Rate = DEFAULT_TAX_PARAMS.isBrackets[0]?.rate || 0.15;
		this.isBracket2Threshold = DEFAULT_TAX_PARAMS.isBrackets[1]?.threshold || 42500;
		this.isBracket2Rate = DEFAULT_TAX_PARAMS.isBrackets[1]?.rate || 0.25;
		this.isBracket3Threshold = DEFAULT_TAX_PARAMS.isBrackets[2]?.threshold || 500000;
		this.isBracket3Rate = DEFAULT_TAX_PARAMS.isBrackets[2]?.rate || 0.28;
		this.dividendIrRate = DEFAULT_TAX_PARAMS.dividendIrRate;
		this.dividendSocialRate = DEFAULT_TAX_PARAMS.dividendSocialRate;
	}
}

// Export d'une instance singleton
export const formStore = new FormStore();
