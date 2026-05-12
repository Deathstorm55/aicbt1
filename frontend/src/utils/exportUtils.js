import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import { toPng } from 'html-to-image';

/**
 * Helper to generate timestamp for filenames and reports
 */
const getTimestamp = () => {
    const now = new Date();
    return now.toISOString().replace(/T/, '_').replace(/:/g, '-').split('.')[0];
};

/**
 * Export JSON data to a CSV file.
 * @param {Array<Object>} data The data array to export.
 * @param {string} filename The name of the file (without extension).
 */
export const exportToCSV = (data, filename = 'export') => {
    if (!data || data.length === 0) return;
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    
    XLSX.writeFile(workbook, `${filename}_${getTimestamp()}.csv`, { bookType: 'csv' });
};

/**
 * Export JSON data to an Excel (.xlsx) file.
 * @param {Array<Object>} data The data array to export.
 * @param {string} filename The name of the file (without extension).
 */
export const exportToExcel = (data, filename = 'export') => {
    if (!data || data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    XLSX.writeFile(workbook, `${filename}_${getTimestamp()}.xlsx`);
};

/**
 * Format and copy data to clipboard.
 * @param {Array<Object>|Object} data Data to copy.
 * @param {string} title A title for the copied data.
 */
export const copyToClipboard = async (data, title = 'Research Data') => {
    try {
        let formattedText = `${title}\nGenerated on: ${new Date().toLocaleString()}\n\n`;
        
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                formattedText += `--- Entry ${index + 1} ---\n`;
                for (const [key, value] of Object.entries(item)) {
                    formattedText += `${key}: ${value}\n`;
                }
                formattedText += '\n';
            });
        } else if (typeof data === 'object') {
            for (const [key, value] of Object.entries(data)) {
                formattedText += `${key}: ${value}\n`;
            }
        } else {
            formattedText += String(data);
        }

        await navigator.clipboard.writeText(formattedText);
        return true;
    } catch (err) {
        console.error('Failed to copy text: ', err);
        return false;
    }
};

/**
 * Capture an HTML element and generate a PDF.
 * @param {HTMLElement} element The HTML element to capture.
 * @param {string} filename The name of the PDF file (without extension).
 */
export const exportDashboardToPDF = async (element, filename = 'dashboard_summary') => {
    if (!element) return;
    
    try {
        const dataUrl = await toPng(element, {
            quality: 0.95,
            backgroundColor: '#1a1a24', // Match dashboard dark theme background
            pixelRatio: 2, // High res
            width: element.scrollWidth,
            height: element.scrollHeight,
            style: {
                transform: 'none',
                margin: '0',
            }
        });

        const img = new Image();
        img.src = dataUrl;
        await new Promise((resolve) => {
            img.onload = resolve;
        });
        
        // Create PDF with exact pixel dimensions to avoid squishing and page break cutoffs
        const pdf = new jsPDF({
            orientation: img.width > img.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [img.width, img.height]
        });

        // Add the image filling the entire page
        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
        
        pdf.save(`${filename}_${getTimestamp()}.pdf`);
        return true;
    } catch (err) {
        console.error('Failed to generate PDF: ', err);
        return false;
    }
};
