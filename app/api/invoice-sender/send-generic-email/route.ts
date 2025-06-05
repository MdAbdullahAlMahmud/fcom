import { NextRequest, NextResponse } from 'next/server'
import { sendInvoiceEmail } from '@/app/invoice-sender/emailService.js'

export async function POST(req: NextRequest) {
  try {
    const { to, subject, html, text, companyName, oauth2 } = await req.json()
    if (!to || !subject || !html || !companyName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Compose a minimal email payload for sendInvoiceEmail
    await sendInvoiceEmail({
      to,
      customerName: '', // Optional, can be blank for generic
      invoiceNumber: '', // Optional, can be blank for generic
      companyName,
      invoiceLink: '', // Optional, can be blank for generic
      oauth2: oauth2 || {
        user: process.env.GMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: undefined,
      },
      // Pass custom subject/html/text if needed (requires emailService.js update for full generic support)
      subject,
      html,
      text,
    })

    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
