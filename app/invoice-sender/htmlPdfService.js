// HTML to PDF Service using Puppeteer
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

/**
 * Generates a PDF from HTML string using Puppeteer.
 * @param {string} html - The HTML content to render.
 * @param {string} outputPath - The path to save the generated PDF.
 * @returns {Promise<string>} - Resolves with the output path.
 */
export async function generatePDFfromHTML(html, outputPath) {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: outputPath, format: 'A4', printBackground: true });
  await browser.close();
  return outputPath;
}
