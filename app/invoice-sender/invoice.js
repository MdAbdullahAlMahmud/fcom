require('dotenv').config();
const express = require('express');
const app = express();
app.use(express.json());

const { generateInvoicePDF } = require('./pdfService');
const { uploadToDrive } = require('./driveService');
const { sendInvoiceEmail } = require('./emailService');
const path = require('path');
const os = require('os');
const { google } = require('googleapis');
const fs = require('fs');
const Handlebars = require('handlebars');
const { generatePDFfromHTML } = require('./htmlPdfService');

app.post('/create-invoice', async (req, res) => {
  try {
    // 1. Validate input
    const { customer, invoice, company } = req.body;
    if (!customer || !invoice || !company) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // 2. Generate PDF from HTML template
    const fileName = `invoice_${invoice.number}.pdf`;
    const outputPath = path.join(os.tmpdir(), fileName);
    // Read and compile HTML template (user's custom template)
    const templateHtml = fs.readFileSync(path.join(__dirname, 'template1.html'), 'utf8');
    const template = Handlebars.compile(templateHtml);
    // Prepare data for template (matching your new template fields)
    const html = template({
      invoiceTitle: 'INVOICE',
      invoiceDate: invoice.date,
      customerName: customer.name,
      customerEmail: customer.email,
      companyName: company.name,
      companyEmail: company.contact || '',
      companyPhone: company.phone || '',
      items: invoice.items,
      subtotal: invoice.subtotal || invoice.items.reduce((sum, i) => sum + (i.total || 0), 0),
      discount: invoice.discount || 0,
      tax: invoice.tax || 0,
      total: invoice.total,
      paymentMethod: invoice.paymentMethod || '',
      thankYou: invoice.thankYou || `Thank you for choosing ${company.name || 'us'}!`,
    });
    await generatePDFfromHTML(html, outputPath);

    // 3. Google OAuth2 setup
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

    // 4. Upload to Google Drive
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined;
    const invoiceLink = await uploadToDrive(oAuth2Client, outputPath, fileName, folderId);

    // 5. Send Email via Gmail OAuth2
    await sendInvoiceEmail({
      to: customer.email,
      customerName: customer.name,
      invoiceNumber: invoice.number,
      companyName: company.name,
      invoiceLink,
      oauth2: {
        user: process.env.GMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: undefined,
      },
    });

    res.json({ message: 'Invoice created and sent!', invoiceLink });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create/send invoice' });
  }
});
