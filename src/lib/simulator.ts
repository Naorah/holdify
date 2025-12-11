/**
 * Module de simulation économique Holding ↔ Filiale
 * 
 * DEPRECATED: Ce fichier est conservé pour la compatibilité avec les tests.
 * La logique a été déplacée dans :
 * - src/lib/services/simulation.service.ts (logique métier)
 * - src/lib/types/simulation.types.ts (types)
 * - src/lib/services/export.service.ts (export CSV)
 * 
 * Ce fichier réexporte les éléments nécessaires pour maintenir la compatibilité.
 */

// Réexport des types depuis le nouveau module
export type {
	TaxBracket,
	TaxParameters,
	ReversalTier,
	ReversalPolicy,
	Shareholder,
	SimulationParameters,
	MonthlyResult
} from './types/simulation.types';

// Réexport des fonctions depuis le service
export {
	calculateIS,
	calculatePFU,
	calculateHoldingReceived,
	calculateReversal,
	calculateShareholdersDividends,
	runSimulation,
	DEFAULT_IS_BRACKETS,
	DEFAULT_TAX_PARAMS
} from './services/simulation.service';

// Réexport de la fonction d'export CSV
export { exportToCSV } from './services/export.service';
