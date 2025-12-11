/**
 * Module pour charger les bibliothèques PDF côté client uniquement
 * Ce fichier est importé uniquement dans le code client pour éviter les problèmes SSR
 * 
 * IMPORTANT: Ce fichier utilise des imports statiques pour garantir le bundling en production.
 * Les imports ne seront pas exécutés côté serveur car ce module n'est importé que dans exportToPDF
 * qui vérifie typeof window === 'undefined' avant d'appeler ces fonctions.
 */

// Imports statiques pour garantir le bundling en production
// Ces imports seront inclus dans le bundle client mais ne seront pas exécutés côté serveur
import html2canvasLib from 'html2canvas';
import { jsPDF as jsPDFLib } from 'jspdf';

/**
 * Charge html2canvas de manière sécurisée
 */
export async function loadHtml2Canvas() {
	if (typeof window === 'undefined') {
		throw new Error('html2canvas ne peut être chargé que côté client');
	}
	return html2canvasLib;
}

/**
 * Charge jsPDF de manière sécurisée
 */
export async function loadJsPDF() {
	if (typeof window === 'undefined') {
		throw new Error('jsPDF ne peut être chargé que côté client');
	}
	return jsPDFLib;
}

