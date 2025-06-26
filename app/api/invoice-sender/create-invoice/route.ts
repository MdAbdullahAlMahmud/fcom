import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import os from 'os'
import fs from 'fs'
import Handlebars from 'handlebars'
import { google } from 'googleapis'
import { generatePDFfromHTML } from '@/app/invoice-sender/htmlPdfService.js'
import { uploadToDrive } from '@/app/invoice-sender/driveService.js'
import { sendInvoiceEmail } from '@/app/invoice-sender/emailService.js'

export async function POST(req: NextRequest) {
  try {
    const { customer, invoice, company } = await req.json()

    if (!customer || !invoice || !company) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    // Generate PDF from HTML template
    const fileName = `invoice_${invoice.number}.pdf`
    const outputPath = path.join(os.tmpdir(), fileName)
    const templateHtml = fs.readFileSync(path.join(process.cwd(), 'app/invoice-sender/template1.html'), 'utf8')
    const template = Handlebars.compile(templateHtml)
    const html = template({
      invoiceTitle: 'INVOICE',
      invoiceDate: invoice.date,
      customerName: customer.name,
      customerEmail: customer.email,
      companyName: company.name,
      companyEmail: company.contact || '',
      companyPhone: company.phone || '',
      items: invoice.items,
      subtotal: invoice.subtotal || (Array.isArray(invoice.items) ? invoice.items.reduce((sum: number, i: any) => sum + (i.total || 0), 0) : 0),
      discount: invoice.discount || 0,
      tax: invoice.tax || 0,
      total: invoice.total || 0,
      paymentMethod: invoice.paymentMethod || '',
      shippingFee: invoice.shippingFee || 0,
      shippingMethod: invoice.shippingMethod || '',
      thankYou: invoice.thankYou || `Thank you for choosing ${company.name || 'us'}!`,
    })
    await generatePDFfromHTML(html, outputPath)

    // Google OAuth2 setup
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )
    oAuth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

    // Upload to Google Drive
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID || undefined
    const invoiceLinkRaw = await uploadToDrive(oAuth2Client, outputPath, fileName, folderId)
    const invoiceLink = invoiceLinkRaw ?? undefined;

    // Send Email via Gmail OAuth2
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
      // Required fields for emailService.js
      subject: undefined,
      html: undefined,
      text: undefined,
    })

    return NextResponse.json({ message: 'Invoice created and sent!', invoiceLink })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to create/send invoice' }, { status: 500 })
  }
}
