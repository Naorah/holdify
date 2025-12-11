/**
 * Service d'export PDF optimisé et minimaliste
 * 
 * Construit un HTML optimisé pour le PDF au lieu de cloner la page complète
 */

import type { MonthlyResult } from '../types/simulation.types';
import { formatCurrency } from './formatters';

/**
 * Convertit un canvas Chart.js en image base64
 */
function canvasToImage(canvas: HTMLCanvasElement): Promise<string> {
	return new Promise((resolve, reject) => {
		if (canvas.width === 0 || canvas.height === 0) {
			reject(new Error('Canvas vide'));
			return;
		}
		try {
			const dataUrl = canvas.toDataURL('image/png', 1.0);
			resolve(dataUrl);
		} catch (e) {
			reject(e);
		}
	});
}

/**
 * Convertit tous les canvas Chart.js en images base64
 */
async function convertAllCanvasesToImages(element: HTMLElement): Promise<Map<number, string>> {
	const canvases = Array.from(element.querySelectorAll('canvas'));
	const images = new Map<number, string>();
	
	const conversions = canvases.map(async (canvas, index) => {
		try {
			const dataUrl = await canvasToImage(canvas);
			images.set(index, dataUrl);
		} catch (e) {
			console.warn(`Erreur conversion canvas ${index}:`, e);
		}
	});
	
	await Promise.all(conversions);
	return images;
}

/**
 * Styles communs pour le PDF
 */
const PDF_STYLES = `
	.pdf-content * { margin: 0; padding: 0; box-sizing: border-box; }
	.pdf-content { font-family: Arial, sans-serif; font-size: 9px; background: white; }
	.pdf-content h1 { font-size: 16px; margin-bottom: 4px; border-bottom: 2px solid black; padding-bottom: 8px; }
	.pdf-content h2 { font-size: 13px; margin: 6px 0 3px 0; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
	.pdf-content .section { margin-bottom: 8px; padding: 5px; border: 1px solid #ddd; }
	.pdf-content .param-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 3px; margin-bottom: 4px; }
	.pdf-content .param-item { display: flex; justify-content: space-between; padding: 1px 0; border-bottom: 1px solid #eee; font-size: 8px; line-height: 1.2; }
	.pdf-content .param-label { font-weight: bold; }
	.pdf-content .param-value { text-align: right; }
	.pdf-content .chart-container { width: 100%; margin: 10px 0; height: 240px; display: flex; align-items: center; justify-content: center; }
	.pdf-content .chart-container img { max-width: 100%; max-height: 240px; width: auto; height: auto; display: block; object-fit: contain; }
	.pdf-content .chart-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
	.pdf-content table { width: 100%; border-collapse: collapse; font-size: 7px; margin: 4px 0; border-spacing: 0; }
	.pdf-content th, .pdf-content td { 
		padding: 6px 4px; 
		text-align: right; 
		border: 1px solid #333; 
		line-height: 1.5; 
		vertical-align: middle; 
		word-wrap: break-word;
		box-sizing: border-box;
		min-height: 20px;
	}
	.pdf-content th { 
		background: #f0f0f0; 
		font-weight: bold; 
		text-align: center; 
		padding: 6px 4px; 
		vertical-align: middle;
	}
	.pdf-content td:first-child, .pdf-content th:first-child { text-align: left; }
	.pdf-content tr { height: auto; display: table-row; }
	.pdf-content tbody tr { display: table-row; }
	.pdf-content thead tr { display: table-row; }
	.pdf-content tr:nth-child(even) { background: #f9f9f9; }
`;

/**
 * Construit le HTML pour la page 1 (Paramètres)
 */
function buildParamsPageHTML(formData: Record<string, any>): string {
	return `
	<style>${PDF_STYLES}</style>
	<div class="pdf-content">
		<h1>Simulation Holdify</h1>
		
		<section class="section">
			<h2>Paramètres de Simulation</h2>
			<div class="param-grid">
				<div class="param-item"><span class="param-label">Recettes Holding:</span><span class="param-value">${formatCurrency(formData.baseMonthlyRevenueHolding || 0)}</span></div>
				<div class="param-item"><span class="param-label">Charges Holding:</span><span class="param-value">${formatCurrency(formData.baseMonthlyChargesHolding || 0)}</span></div>
				<div class="param-item"><span class="param-label">Recettes Filiale:</span><span class="param-value">${formatCurrency(formData.baseMonthlyRevenueSubsidiary || 0)}</span></div>
				<div class="param-item"><span class="param-label">Charges Filiale:</span><span class="param-value">${formatCurrency(formData.baseMonthlyChargesSubsidiary || 0)}</span></div>
				<div class="param-item"><span class="param-label">Capital Initial Filiale:</span><span class="param-value">${formatCurrency(formData.initialSubsidiaryCapital || 0)}</span></div>
				<div class="param-item"><span class="param-label">Durée:</span><span class="param-value">${formData.durationMonths || 0} mois</span></div>
				<div class="param-item"><span class="param-label">Volatilité:</span><span class="param-value">${((formData.volatility || 0) * 100).toFixed(1)}%</span></div>
				<div class="param-item"><span class="param-label">Croissance mensuelle:</span><span class="param-value">${((formData.monthlyGrowthRate || 0) * 100).toFixed(2)}%</span></div>
				<div class="param-item"><span class="param-label">Ratio dividende sur bénéfice:</span><span class="param-value">${((formData.dividendOnProfitRatio || 0) * 100).toFixed(2)}%</span></div>
				${formData.useCapitalBasedRevenue ? `
				<div class="param-item"><span class="param-label">Recettes basées sur capital:</span><span class="param-value">Oui</span></div>
				<div class="param-item"><span class="param-label">Taux recette sur capital:</span><span class="param-value">${((formData.capitalRevenueRate || 0) * 100).toFixed(3)}%</span></div>
				` : `
				<div class="param-item"><span class="param-label">Recettes basées sur capital:</span><span class="param-value">Non</span></div>
				`}
			</div>
		</section>
		
		${formData.shareholders && formData.shareholders.length > 0 ? `
		<section class="section">
			<h2>Actionnaires</h2>
			<table>
				<thead>
					<tr>
						<th>Nom</th>
						<th>Investissement</th>
						<th>Taux dividende</th>
						<th>Mode rémunération</th>
					</tr>
				</thead>
				<tbody>
					${formData.shareholders.map((sh: any) => {
						const format = (val: number) => new Intl.NumberFormat('fr-FR', { 
							minimumFractionDigits: 0, 
							maximumFractionDigits: 0 
						}).format(val);
						return `
						<tr>
							<td>${sh.name || '-'}</td>
							<td>${format(sh.investment || 0)} €</td>
							<td>${((sh.dividendRate || 0) * 100).toFixed(2)}%</td>
							<td>${sh.remunerationMode === 'on_profit' ? 'Sur bénéfice' : sh.remunerationMode === 'fixed' ? 'Fixe' : '-'}</td>
						</tr>
					`;
					}).join('')}
				</tbody>
			</table>
		</section>
		` : ''}
		
		<section class="section">
			<h2>Paramètres Fiscaux</h2>
			<div class="param-grid">
				<div class="param-item"><span class="param-label">Tranche IS 1 - Seuil:</span><span class="param-value">${formatCurrency(formData.isBracket1Threshold || 0)}</span></div>
				<div class="param-item"><span class="param-label">Tranche IS 1 - Taux:</span><span class="param-value">${((formData.isBracket1Rate || 0) * 100).toFixed(1)}%</span></div>
				<div class="param-item"><span class="param-label">Tranche IS 2 - Seuil:</span><span class="param-value">${formatCurrency(formData.isBracket2Threshold || 0)}</span></div>
				<div class="param-item"><span class="param-label">Tranche IS 2 - Taux:</span><span class="param-value">${((formData.isBracket2Rate || 0) * 100).toFixed(1)}%</span></div>
				<div class="param-item"><span class="param-label">Tranche IS 3 - Seuil:</span><span class="param-value">${formatCurrency(formData.isBracket3Threshold || 0)}</span></div>
				<div class="param-item"><span class="param-label">Tranche IS 3 - Taux:</span><span class="param-value">${((formData.isBracket3Rate || 0) * 100).toFixed(1)}%</span></div>
				<div class="param-item"><span class="param-label">Taux IR dividendes:</span><span class="param-value">${((formData.dividendIrRate || 0) * 100).toFixed(2)}%</span></div>
				<div class="param-item"><span class="param-label">Taux CS dividendes:</span><span class="param-value">${((formData.dividendSocialRate || 0) * 100).toFixed(2)}%</span></div>
			</div>
		</section>
	</div>
	`.trim();
}

/**
 * Construit le HTML pour la page 2 (Visualisations)
 */
function buildChartsPageHTML(chartImages: Map<number, string>): string {
	const chartImagesArray = Array.from(chartImages.values());
	
	if (chartImagesArray.length === 0) {
		return '';
	}
	
	return `
	<style>${PDF_STYLES}</style>
	<div class="pdf-content">
		<h1>Visualisations</h1>
		<div class="chart-grid">
			${chartImagesArray.map((imgSrc, index) => `
				<div class="chart-container">
					<img src="${imgSrc}" alt="Graphique ${index + 1}" />
				</div>
			`).join('')}
		</div>
	</div>
	`.trim();
}

/**
 * Construit le HTML pour la page 3 (Détail Mensuel)
 */
function buildTablePageHTML(results: MonthlyResult[]): string {
	if (results.length === 0) {
		return '';
	}
	
	return `
	<style>${PDF_STYLES}</style>
	<div class="pdf-content">
		<h1>Détail Mensuel</h1>
		<table>
			<thead>
				<tr>
					<th rowspan="2">Mois</th>
					<th colspan="3">Holding</th>
					<th colspan="3">Filiale</th>
					<th colspan="4">Résultats</th>
					<th colspan="2">Capitaux</th>
				</tr>
				<tr>
					<th>Recette</th>
					<th>Charges</th>
					<th>Résultat</th>
					<th>Recette</th>
					<th>Charges</th>
					<th>Résultat</th>
					<th>Bénéfice</th>
					<th>IS</th>
					<th>Dividende Bénéf.</th>
					<th>Dividendes Act.</th>
					<th>Filiale</th>
					<th>Holding</th>
				</tr>
			</thead>
			<tbody>
				${results.map(r => {
					const format = (val: number) => {
						// Format standard avec séparateur de milliers
						return new Intl.NumberFormat('fr-FR', { 
							minimumFractionDigits: 0, 
							maximumFractionDigits: 0 
						}).format(Math.round(val));
					};
					return `
					<tr>
						<td>${r.month}</td>
						<td>${format(r.revenueHolding)}</td>
						<td>${format(r.chargesHolding)}</td>
						<td>${format(r.resultHolding)}</td>
						<td>${format(r.revenueSubsidiary)}</td>
						<td>${format(r.chargesSubsidiary)}</td>
						<td>${format(r.resultSubsidiary)}</td>
						<td>${format(r.profitHolding)}</td>
						<td>${format(r.isAmount)}</td>
						<td>${format(r.dividendOnProfit)}</td>
						<td>${format(r.shareholdersDividends)}</td>
						<td>${format(r.subsidiaryCapital)}</td>
						<td>${format(r.holdingCapital)}</td>
					</tr>
				`;
				}).join('')}
			</tbody>
		</table>
	</div>
	`.trim();
}

/**
 * Capture une section HTML en canvas
 */
async function captureSectionToCanvas(
	htmlContent: string,
	html2canvas: any,
	containerWidth: number = 1200
): Promise<HTMLCanvasElement> {
	const container = document.createElement('div');
	container.id = 'pdf-section-container';
	container.style.cssText = `
		position: absolute;
		top: 0;
		left: -9999px;
		width: ${containerWidth}px;
		background: white;
		padding: 20px;
		z-index: 1;
		visibility: visible;
		opacity: 1;
		overflow: visible;
		display: block;
	`;
	container.innerHTML = htmlContent;
	document.body.appendChild(container);
	
	try {
		// Forcer le rendu
		container.offsetHeight;
		await new Promise(resolve => setTimeout(resolve, 300));
		
		// Attendre que les images soient chargées
		const images = container.querySelectorAll('img');
		await Promise.all(Array.from(images).map((img) => {
			if ((img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0) {
				return Promise.resolve();
			}
			return new Promise(resolve => {
				(img as HTMLImageElement).onload = resolve;
				(img as HTMLImageElement).onerror = resolve;
				setTimeout(resolve, 2000);
			});
		}));
		
		// Repositionner pour html2canvas
		container.style.position = 'static';
		container.style.left = 'auto';
		container.style.top = 'auto';
		container.style.transform = 'none';
		container.style.margin = '0';
		
		await new Promise(resolve => setTimeout(resolve, 200));
		
		const containerHeight = container.scrollHeight || 1000;
		
		// Capturer avec html2canvas
		const canvas = await html2canvas(container, {
			scale: 1.5,
			useCORS: true,
			allowTaint: true,
			backgroundColor: '#ffffff',
			width: containerWidth,
			height: containerHeight,
			windowWidth: containerWidth,
			windowHeight: containerHeight,
			scrollX: 0,
			scrollY: 0,
			x: 0,
			y: 0,
			logging: false,
			onclone: (clonedDoc: Document) => {
				// S'assurer que tous les tableaux sont visibles et bien formatés
				const tables = clonedDoc.querySelectorAll('table');
				tables.forEach((table) => {
					const tableEl = table as HTMLElement;
					tableEl.style.display = 'table';
					tableEl.style.visibility = 'visible';
					tableEl.style.opacity = '1';
					tableEl.style.width = '100%';
					tableEl.style.borderCollapse = 'collapse';
					tableEl.style.borderSpacing = '0';
					
					// S'assurer que toutes les lignes sont visibles
					const rows = tableEl.querySelectorAll('tr');
					rows.forEach((row) => {
						const rowEl = row as HTMLElement;
						rowEl.style.display = 'table-row';
						rowEl.style.visibility = 'visible';
						rowEl.style.opacity = '1';
					});
					
					// S'assurer que toutes les cellules sont visibles et bien alignées
					const cells = tableEl.querySelectorAll('th, td');
					cells.forEach((cell) => {
						const cellEl = cell as HTMLElement;
						cellEl.style.display = 'table-cell';
						cellEl.style.visibility = 'visible';
						cellEl.style.opacity = '1';
						cellEl.style.verticalAlign = 'middle';
						cellEl.style.boxSizing = 'border-box';
						cellEl.style.padding = '6px 4px';
						cellEl.style.border = '1px solid #333';
						cellEl.style.lineHeight = '1.5';
						cellEl.style.minHeight = '20px';
						if (cell.tagName === 'TH') {
							cellEl.style.padding = '7px 4px';
							cellEl.style.textAlign = 'center';
							cellEl.style.fontWeight = 'bold';
							cellEl.style.backgroundColor = '#f0f0f0';
						} else {
							cellEl.style.textAlign = 'right';
						}
						// Première colonne alignée à gauche
						if (cell.previousElementSibling === null) {
							cellEl.style.textAlign = 'left';
						}
					});
				});
			}
		});
		
		return canvas;
	} finally {
		if (container.parentElement) {
			document.body.removeChild(container);
		}
	}
}

/**
 * Ajoute un canvas à une page PDF
 */
function addCanvasToPDFPage(
	pdf: any,
	canvas: HTMLCanvasElement,
	margin: number,
	contentWidth: number,
	contentHeight: number
): void {
	const imgWidth = canvas.width;
	const imgHeight = canvas.height;
	const scaledWidth = contentWidth;
	const scaledHeight = (imgHeight / imgWidth) * scaledWidth;
	
	let yPosition = margin;
	let remainingHeight = scaledHeight;
	let sourceY = 0;
	
	while (remainingHeight > 0) {
		const heightToAdd = Math.min(remainingHeight, contentHeight);
		const sourceHeight = (heightToAdd / scaledHeight) * imgHeight;
		
		const tempCanvas = document.createElement('canvas');
		tempCanvas.width = imgWidth;
		tempCanvas.height = Math.ceil(sourceHeight);
		const tempCtx = tempCanvas.getContext('2d');
		if (tempCtx) {
			tempCtx.drawImage(canvas, 0, sourceY, imgWidth, sourceHeight, 0, 0, imgWidth, sourceHeight);
			const tempImgData = tempCanvas.toDataURL('image/jpeg', 0.95);
			
			pdf.addImage(tempImgData, 'JPEG', margin, yPosition, scaledWidth, heightToAdd);
		}
		
		remainingHeight -= contentHeight;
		sourceY += sourceHeight;
		yPosition = margin;
		
		if (remainingHeight > 0) {
			pdf.addPage();
		}
	}
}

/**
 * Exporte les données en PDF avec un HTML optimisé
 */
export async function exportToPDF(
	element: HTMLElement,
	filename: string,
	formData?: Record<string, any>,
	results?: MonthlyResult[]
): Promise<void> {
	if (typeof window === 'undefined') {
		throw new Error('exportToPDF ne peut être appelé que côté client');
	}

	// Créer l'overlay de chargement
	const loadingOverlay = document.createElement('div');
	loadingOverlay.id = 'pdf-loading-overlay';
	loadingOverlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		z-index: 99999;
		color: white;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		backdrop-filter: blur(4px);
		pointer-events: auto;
	`;
	
	loadingOverlay.innerHTML = `
		<div style="text-align: center; padding: 30px; background: rgba(0,0,0,0.9); border-radius: 12px; box-shadow: 0 8px 32px rgba(0,0,0,0.5);">
			<div style="width: 50px; height: 50px; border: 4px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
			<div style="font-size: 18px; font-weight: bold; margin-bottom: 8px;">Génération du PDF...</div>
			<div style="font-size: 14px; opacity: 0.9;">Veuillez patienter</div>
		</div>
		<style>
			@keyframes spin {
				to { transform: rotate(360deg); }
			}
		</style>
	`;
	
	document.body.appendChild(loadingOverlay);

	try {
		// Attendre un peu pour que les canvas soient rendus
		await new Promise(resolve => setTimeout(resolve, 500));
		
		// Convertir les canvas en images (rapide, en parallèle)
		const chartImages = await convertAllCanvasesToImages(element);
		console.log(`[PDF] ${chartImages.size} canvas convertis en images`);
		
		// Utiliser les données fournies ou des valeurs par défaut
		const finalFormData = formData || {};
		const finalResults = results || [];
		
		console.log(`[PDF] Données: ${finalResults.length} résultats, ${Object.keys(finalFormData).length} paramètres`);
		
		// Garder l'overlay visible pendant toute la génération
		// Ne pas le masquer pour permettre la capture
		
		// Importer html2canvas et jsPDF directement
		const html2canvas = (await import('html2canvas')).default;
		const jsPDFModule = await import('jspdf');
		const { jsPDF } = jsPDFModule;
		
		// Créer le PDF
		const pdf = new jsPDF({
			orientation: 'landscape',
			unit: 'mm',
			format: 'a4',
			compress: true
		});
		
		// Dimensions A4 paysage en mm
		const pdfWidth = 297;
		const pdfHeight = 210;
		const margin = 8;
		const contentWidth = pdfWidth - (margin * 2);
		const contentHeight = pdfHeight - (margin * 2);
		const containerWidth = 900;
		
		// Page 1: Paramètres
		console.log(`[PDF] Génération page 1: Paramètres...`);
		const paramsHTML = buildParamsPageHTML(finalFormData);
		const paramsCanvas = await captureSectionToCanvas(paramsHTML, html2canvas, containerWidth);
		addCanvasToPDFPage(pdf, paramsCanvas, margin, contentWidth, contentHeight);
		
		// Page 2: Visualisations
		if (chartImages.size > 0) {
			console.log(`[PDF] Génération page 2: Visualisations...`);
			pdf.addPage();
			const chartsHTML = buildChartsPageHTML(chartImages);
			const chartsCanvas = await captureSectionToCanvas(chartsHTML, html2canvas, containerWidth);
			addCanvasToPDFPage(pdf, chartsCanvas, margin, contentWidth, contentHeight);
		}
		
		// Page 3: Détail Mensuel
		if (finalResults.length > 0) {
			console.log(`[PDF] Génération page 3: Détail Mensuel...`);
			pdf.addPage();
			const tableHTML = buildTablePageHTML(finalResults);
			// Utiliser une largeur réduite pour le tableau pour éviter le débordement
			const tableContainerWidth = 800;
			const tableCanvas = await captureSectionToCanvas(tableHTML, html2canvas, tableContainerWidth);
			addCanvasToPDFPage(pdf, tableCanvas, margin, contentWidth, contentHeight);
		}
		
		// Sauvegarder le PDF
		const pdfFilename = `${filename}_${new Date().toISOString().split('T')[0]}.pdf`;
		pdf.save(pdfFilename);
		
		console.log(`[PDF] PDF généré avec succès: ${pdfFilename}`);
		
		// Attendre que le téléchargement soit complètement terminé avant de retirer l'overlay
		// Le save() déclenche le téléchargement de manière synchrone mais le téléchargement peut prendre du temps
		// On attend suffisamment longtemps pour que le téléchargement soit terminé
		await new Promise(resolve => setTimeout(resolve, 1500));
	} catch (error) {
		console.error('Erreur lors de la génération du PDF:', error);
		throw error;
	} finally {
		// Retirer l'overlay
		if (loadingOverlay.parentElement) {
			document.body.removeChild(loadingOverlay);
		}
	}
}
