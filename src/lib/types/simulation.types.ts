/**
 * Types partagés pour la simulation économique
 * 
 * Ce fichier contient tous les types et interfaces utilisés dans l'application
 */

// ============================================================================
// TYPES FISCAUX
// ============================================================================

/**
 * Tranche d'imposition pour le calcul de l'IS
 */
export interface TaxBracket {
	/** Seuil minimum de la tranche (en euros) */
	threshold: number;
	/** Taux d'imposition de la tranche (en décimal, ex: 0.15 pour 15%) */
	rate: number;
}

/**
 * Paramètres fiscaux configurables
 */
export interface TaxParameters {
	/** Barème de l'IS (tranches progressives) */
	isBrackets: TaxBracket[];
	/** Taux de l'IR sur les dividendes (en décimal, ex: 0.128 pour 12.8%) */
	dividendIrRate: number;
	/** Taux des prélèvements sociaux sur les dividendes (en décimal, ex: 0.172 pour 17.2%) */
	dividendSocialRate: number;
}

// ============================================================================
// TYPES DE REVERSEMENT
// ============================================================================

/**
 * Palier de reversement (si bénéfice > seuil, alors reverser montant)
 */
export interface ReversalTier {
	/** Seuil de bénéfice (en euros) */
	profitThreshold: number;
	/** Montant à reverser si le seuil est atteint (en euros) */
	amount: number;
}

/**
 * Politique de reversement de la holding vers la filiale
 */
export type ReversalPolicy =
	| { type: 'none' }
	| { type: 'pct_of_holding'; percentage: number }
	| { type: 'conditional'; threshold: number; amount: number }
	| { type: 'tiered'; tiers: ReversalTier[] };

// ============================================================================
// TYPES ACTIONNAIRES
// ============================================================================

/**
 * Mode de rémunération des actionnaires
 */
export type ShareholderRemunerationMode = 
	| 'on_profit'      // %age annuel sur les bénéfices
	| 'on_investment'; // %age annuel sur l'investissement de base

/**
 * Paramètres d'un actionnaire
 */
export interface Shareholder {
	/** Nom de l'actionnaire */
	name: string;
	/** Montant investi (en euros) */
	investment: number;
	/** Pourcentage de dividendes annuel (en décimal, ex: 0.05 pour 5%) */
	dividendRate: number;
	/** Mode de rémunération */
	remunerationMode: ShareholderRemunerationMode;
}

// ============================================================================
// TYPES DE SIMULATION
// ============================================================================

/**
 * Paramètres de simulation complets
 */
export interface SimulationParameters {
	/** Recettes mensuelles de base de la holding (en euros) */
	baseMonthlyRevenueHolding: number;
	/** Recettes mensuelles de base de la filiale (en euros) */
	baseMonthlyRevenueSubsidiary: number;
	/** Charges mensuelles de base de la holding (en euros) */
	baseMonthlyChargesHolding: number;
	/** Charges mensuelles de base de la filiale (en euros) */
	baseMonthlyChargesSubsidiary: number;
	/** Volatilité (écart-type en pourcentage, ex: 0.1 pour 10%) */
	volatility: number;
	/** Taux de croissance mensuel (en décimal, ex: 0.02 pour 2%) */
	monthlyGrowthRate: number;
	/** Ratio de distribution des dividendes (0-1, ex: 0.5 pour 50%) - Non utilisé dans le nouveau modèle */
	dividendPayoutRatio: number;
	/** Capital initial de la filiale (en euros) */
	initialSubsidiaryCapital: number;
	/** Capital initial de la holding (en euros) */
	initialHoldingCapital: number;
	/** Politique de reversement */
	reversalPolicy: ReversalPolicy;
	/** Durée de la simulation en mois */
	durationMonths: number;
	/** Paramètres fiscaux */
	taxParams: TaxParameters;
	/** Liste des actionnaires */
	shareholders: Shareholder[];
	/** Ratio de dividende sur bénéfice (en décimal, ex: 0.05 pour 5%) */
	dividendOnProfitRatio: number;
}

/**
 * Résultat d'un mois de simulation
 */
export interface MonthlyResult {
	/** Numéro du mois (1-indexed) */
	month: number;
	/** Recettes de la holding (en euros) */
	revenueHolding: number;
	/** Charges de la holding (en euros) */
	chargesHolding: number;
	/** Résultat de la holding avant IS (recettes - charges) */
	resultHolding: number;
	/** Recettes de la filiale (en euros) */
	revenueSubsidiary: number;
	/** Charges de la filiale (en euros) */
	chargesSubsidiary: number;
	/** Résultat de la filiale (recettes - charges) */
	resultSubsidiary: number;
	/** Bénéfice de la holding (résultat > 0) */
	profitHolding: number;
	/** Montant de l'IS payé par la holding */
	isAmount: number;
	/** Profit net de la holding après IS */
	profitNet: number;
	/** Dividende sur bénéfice (5% du bénéfice) */
	dividendOnProfit: number;
	/** Dividendes versés aux actionnaires (depuis la holding) */
	shareholdersDividends: number;
	/** Reversement de la holding vers la filiale */
	holdingToSubsidiary: number;
	/** Capital de la filiale après opérations */
	subsidiaryCapital: number;
	/** Capital de la holding après opérations */
	holdingCapital: number;
}

