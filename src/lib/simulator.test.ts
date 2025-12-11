/**
 * Tests unitaires pour le module simulator.ts
 * 
 * Ces tests vérifient la logique de calcul fiscale et de simulation
 * pour s'assurer que les calculs sont corrects.
 */

import { describe, it, expect } from 'vitest';
import {
	calculateIS,
	calculatePFU,
	calculateHoldingReceived,
	runSimulation,
	exportToCSV,
	type SimulationParameters,
	DEFAULT_TAX_PARAMS
} from './simulator';
// Les imports fonctionnent via les réexports de simulator.ts

describe('simulator', () => {
	describe('calculateIS', () => {
		it('devrait retourner 0 pour un profit négatif ou nul', () => {
			const brackets = [{ threshold: 0, rate: 0.15 }];
			expect(calculateIS(0, brackets)).toBe(0);
			expect(calculateIS(-1000, brackets)).toBe(0);
		});

		it('devrait calculer l\'IS avec un taux unique', () => {
			const brackets = [{ threshold: 0, rate: 0.15 }];
			expect(calculateIS(10000, brackets)).toBe(1500);
			expect(calculateIS(50000, brackets)).toBe(7500);
		});

		it('devrait calculer l\'IS avec un barème progressif', () => {
			const brackets = [
				{ threshold: 0, rate: 0.15 },
				{ threshold: 42500, rate: 0.25 },
				{ threshold: 500000, rate: 0.28 }
			];

			// Profit dans la première tranche
			expect(calculateIS(30000, brackets)).toBe(4500); // 30000 * 0.15

			// Profit dans la deuxième tranche
			const profit = 60000;
			const expected = 42500 * 0.15 + (60000 - 42500) * 0.25; // 6375 + 4375 = 10750
			expect(calculateIS(profit, brackets)).toBeCloseTo(10750, 2);
		});

		it('devrait arrondir à 2 décimales', () => {
			const brackets = [{ threshold: 0, rate: 0.15 }];
			const result = calculateIS(1000.333, brackets);
			expect(result).toBe(150.05); // 1000.333 * 0.15 = 150.04995 arrondi à 150.05
		});
	});

	describe('calculatePFU', () => {
		it('devrait retourner 0 pour un dividende nul ou négatif', () => {
			expect(calculatePFU(0, 0.128, 0.172)).toBe(0);
			expect(calculatePFU(-1000, 0.128, 0.172)).toBe(0);
		});

		it('devrait calculer le PFU correctement', () => {
			const dividend = 10000;
			const irRate = 0.128;
			const socialRate = 0.172;
			const expected = 10000 * (0.128 + 0.172); // 3000
			expect(calculatePFU(dividend, irRate, socialRate)).toBe(expected);
		});

		it('devrait arrondir à 2 décimales', () => {
			const result = calculatePFU(1000.333, 0.128, 0.172);
			expect(result).toBe(300.1); // 1000.333 * 0.3 = 300.0999 arrondi à 300.10
		});
	});

	describe('calculateHoldingReceived', () => {
		it('devrait calculer le montant net reçu', () => {
			expect(calculateHoldingReceived(10000, 3000)).toBe(7000);
			expect(calculateHoldingReceived(5000, 1500)).toBe(3500);
		});

		it('devrait arrondir à 2 décimales', () => {
			const result = calculateHoldingReceived(1000.333, 300.1);
			expect(result).toBe(700.23);
		});
	});

	describe('runSimulation', () => {
		it('devrait générer des résultats pour chaque mois', () => {
			const params: SimulationParameters = {
				baseMonthlyRevenueHolding: 10000,
				baseMonthlyRevenueSubsidiary: 5000,
				baseMonthlyChargesHolding: 5000,
				baseMonthlyChargesSubsidiary: 3000,
				volatility: 0.1,
				monthlyGrowthRate: 0.02,
				dividendPayoutRatio: 0,
				initialSubsidiaryCapital: 100000,
				initialHoldingCapital: 50000,
				reversalPolicy: { type: 'none' },
				durationMonths: 3,
				taxParams: DEFAULT_TAX_PARAMS,
				shareholders: [],
				dividendOnProfitRatio: 0.05
			};

			const results = runSimulation(params);
			expect(results).toHaveLength(3);
			expect(results[0].month).toBe(1);
			expect(results[1].month).toBe(2);
			expect(results[2].month).toBe(3);
		});

		it('devrait calculer correctement les flux financiers', () => {
			const params: SimulationParameters = {
				baseMonthlyRevenueHolding: 10000,
				baseMonthlyRevenueSubsidiary: 5000,
				baseMonthlyChargesHolding: 5000,
				baseMonthlyChargesSubsidiary: 3000,
				volatility: 0, // Pas de volatilité pour des résultats prévisibles
				monthlyGrowthRate: 0,
				dividendPayoutRatio: 0,
				initialSubsidiaryCapital: 100000,
				initialHoldingCapital: 50000,
				reversalPolicy: { type: 'none' },
				durationMonths: 1,
				taxParams: {
					isBrackets: [{ threshold: 0, rate: 0.15 }],
					dividendIrRate: 0.128,
					dividendSocialRate: 0.172
				},
				shareholders: [],
				dividendOnProfitRatio: 0.05
			};

			const results = runSimulation(params);
			const result = results[0];

			// Vérifications de base
			expect(result.profitHolding).toBeGreaterThanOrEqual(0);
			expect(result.isAmount).toBeGreaterThanOrEqual(0);
			expect(result.profitNet).toBe(result.profitHolding - result.isAmount);
			expect(result.shareholdersDividends).toBeGreaterThanOrEqual(0);
			expect(result.holdingToSubsidiary).toBeGreaterThanOrEqual(0);
		});

		it('devrait gérer la politique de reversement "pct_of_holding"', () => {
			const params: SimulationParameters = {
				baseMonthlyRevenueHolding: 10000,
				baseMonthlyRevenueSubsidiary: 5000,
				baseMonthlyChargesHolding: 5000,
				baseMonthlyChargesSubsidiary: 3000,
				volatility: 0,
				monthlyGrowthRate: 0,
				dividendPayoutRatio: 0,
				initialSubsidiaryCapital: 100000,
				initialHoldingCapital: 100000, // Capital initial élevé
				reversalPolicy: { type: 'pct_of_holding', percentage: 0.1 }, // 10%
				durationMonths: 1,
				taxParams: {
					isBrackets: [{ threshold: 0, rate: 0.15 }],
					dividendIrRate: 0.128,
					dividendSocialRate: 0.172
				},
				shareholders: [],
				dividendOnProfitRatio: 0.05
			};

			const results = runSimulation(params);
			const result = results[0];

			// Le reversement devrait être 10% du capital holding initial
			const expectedReversal = 100000 * 0.1;
			expect(result.holdingToSubsidiary).toBeCloseTo(expectedReversal, 2);
		});

		it('devrait gérer la politique de reversement "conditional"', () => {
			const params: SimulationParameters = {
				baseMonthlyRevenueHolding: 10000,
				baseMonthlyRevenueSubsidiary: 5000,
				baseMonthlyChargesHolding: 5000,
				baseMonthlyChargesSubsidiary: 3000,
				volatility: 0,
				monthlyGrowthRate: 0,
				dividendPayoutRatio: 0,
				initialSubsidiaryCapital: 100000,
				initialHoldingCapital: 150000, // Au-dessus du seuil
				reversalPolicy: { type: 'conditional', threshold: 100000, amount: 5000 },
				durationMonths: 1,
				taxParams: {
					isBrackets: [{ threshold: 0, rate: 0.15 }],
					dividendIrRate: 0.128,
					dividendSocialRate: 0.172
				},
				shareholders: [],
				dividendOnProfitRatio: 0.05
			};

			const results = runSimulation(params);
			const result = results[0];

			// Le reversement devrait être le montant fixe car le seuil est atteint
			expect(result.holdingToSubsidiary).toBe(5000);
		});
	});

	describe('exportToCSV', () => {
		it('devrait générer un CSV valide', () => {
			const results = [
				{
					month: 1,
					revenueHolding: 10000,
					chargesHolding: 5000,
					resultHolding: 5000,
					revenueSubsidiary: 5000,
					chargesSubsidiary: 3000,
					resultSubsidiary: 2000,
					profitHolding: 5000,
					isAmount: 750,
					profitNet: 4250,
					dividendOnProfit: 212.5,
					shareholdersDividends: 0,
					holdingToSubsidiary: 0,
					subsidiaryCapital: 102000,
					holdingCapital: 9037.5
				}
			];

			const csv = exportToCSV(results);
			expect(csv).toContain('Mois');
			expect(csv).toContain('Bénéfice Holding');
			expect(csv).toContain('1');
			expect(csv).toContain('5000.00');
		});

		it('devrait inclure toutes les colonnes', () => {
			const results = [
				{
					month: 1,
					revenueHolding: 10000,
					chargesHolding: 5000,
					resultHolding: 5000,
					revenueSubsidiary: 5000,
					chargesSubsidiary: 3000,
					resultSubsidiary: 2000,
					profitHolding: 5000,
					isAmount: 750,
					profitNet: 4250,
					dividendOnProfit: 212.5,
					shareholdersDividends: 0,
					holdingToSubsidiary: 0,
					subsidiaryCapital: 102000,
					holdingCapital: 9037.5
				}
			];

			const csv = exportToCSV(results);
			const lines = csv.split('\n');
			const headers = lines[0].split(',');

			expect(headers).toHaveLength(15);
			expect(headers).toContain('Mois');
			expect(headers).toContain('Capital Filiale');
			expect(headers).toContain('Capital Holding');
		});
	});
});

