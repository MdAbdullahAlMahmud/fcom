// PDF Service: Generates invoice PDFs using PDFKit
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

function generateInvoicePDF(invoiceData, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Header: Logo and Invoice No
    if (invoiceData.company.logo) {
      try {
        doc.image(invoiceData.company.logo, 40, 40, { width: 80 });
      } catch (e) { /* ignore logo errors */ }
    }
    doc.fontSize(10).text(`NO. ${invoiceData.invoice.number}`, 470, 50, { align: 'right' });

    // INVOICE Title
    doc.font('Helvetica-Bold').fontSize(38).text('INVOICE', 40, 110);
    doc.font('Helvetica').fontSize(12);
    doc.text('Date:', 40, 160, { continued: true, font: 'Helvetica-Bold' })
      .font('Helvetica').text(`  ${invoiceData.invoice.date}`);

    // Billed to / From
    doc.font('Helvetica-Bold').text('Billed to:', 40, 190);
    doc.font('Helvetica').text(invoiceData.customer.name, 40, 205);
    if (invoiceData.customer.address) doc.text(invoiceData.customer.address);
    if (invoiceData.customer.email) doc.text(invoiceData.customer.email);

    doc.font('Helvetica-Bold').text('From:', 300, 190);
    doc.font('Helvetica').text(invoiceData.company.name, 300, 205);
    if (invoiceData.company.address) doc.text(invoiceData.company.address);
    if (invoiceData.company.contact) doc.text(invoiceData.company.contact);

    // Table Header
    doc.moveDown(2);
    const tableTop = 270;
    doc.font('Helvetica-Bold').fontSize(12);
    doc.rect(40, tableTop, 520, 24).fill('#f5f5f5').stroke();
    doc.fillColor('#000').text('Item', 50, tableTop + 7)
      .text('Quantity', 220, tableTop + 7)
      .text('Price', 320, tableTop + 7)
      .text('Amount', 420, tableTop + 7);
    doc.font('Helvetica').fontSize(12);
    let y = tableTop + 30;
    invoiceData.invoice.items.forEach(item => {
      doc.text(item.description, 50, y)
        .text(item.quantity, 230, y)
        .text(`$${item.unitPrice}`, 320, y)
        .text(`$${item.total}`, 420, y);
      y += 22;
    });
    // Total row
    y += 10;
    doc.font('Helvetica-Bold').text('Total', 320, y).text(`$${invoiceData.invoice.total}`, 420, y);
    doc.font('Helvetica').fontSize(12);

    // Payment method and note
    y += 40;
    if (invoiceData.invoice.paymentMethod) {
      doc.font('Helvetica-Bold').text('Payment method:', 40, y, { continued: true })
        .font('Helvetica').text(`  ${invoiceData.invoice.paymentMethod}`);
      y += 20;
    }
    if (invoiceData.invoice.note) {
      doc.font('Helvetica-Bold').text('Note:', 40, y, { continued: true })
        .font('Helvetica').text(`  ${invoiceData.invoice.note}`);
    }

    // Simple wave/curve at the bottom
    doc.save();
    doc.moveTo(0, 750).lineTo(200, 800).lineTo(600, 750).lineTo(600, 842).lineTo(0, 842).closePath().fill('#e0e0e0');
    doc.restore();

    doc.end();
    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

module.exports = { generateInvoicePDF };
