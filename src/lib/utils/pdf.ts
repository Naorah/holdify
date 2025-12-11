/**
 * Service d'export PDF
 * 
 * Gère l'export de la page en PDF via html2pdf.js
 */

/**
 * Exporte un élément HTML en PDF
 * 
 * @param element Element HTML à exporter
 * @param filename Nom du fichier (sans extension)
 * @returns Promise qui se résout quand l'export est terminé
 */
export async function exportToPDF(element: HTMLElement, filename: string): Promise<void> {
	if (typeof window === 'undefined') {
		throw new Error('exportToPDF ne peut être appelé que côté client');
	}

	// Import dynamique pour éviter les erreurs SSR
	const html2pdfModule = await import('html2pdf.js');
	
	// html2pdf.js peut s'exporter de différentes façons selon l'environnement
	// Essayer différentes méthodes d'accès à la fonction html2pdf
	// @ts-expect-error - html2pdf.js n'a pas de types TypeScript
	let html2pdf: any;
	if (typeof html2pdfModule.default === 'function') {
		html2pdf = html2pdfModule.default;
	} else if (html2pdfModule.default && typeof html2pdfModule.default.html2pdf === 'function') {
		html2pdf = html2pdfModule.default.html2pdf;
	} else if (typeof html2pdfModule.html2pdf === 'function') {
		html2pdf = html2pdfModule.html2pdf;
	} else if (typeof html2pdfModule === 'function') {
		html2pdf = html2pdfModule;
	} else {
		throw new Error('Impossible de charger html2pdf.js - format d\'export non reconnu');
	}

	const opt = {
		margin: [10, 10, 10, 10],
		filename: `${filename}_${new Date().toISOString().split('T')[0]}.pdf`,
		image: { type: 'jpeg', quality: 0.98 },
		html2canvas: {
			scale: 2,
			useCORS: true,
			letterRendering: true,
			logging: false
		},
		jsPDF: {
			unit: 'mm',
			format: 'a4',
			orientation: 'portrait'
		}
	};

	await html2pdf().set(opt).from(element).save();
}

