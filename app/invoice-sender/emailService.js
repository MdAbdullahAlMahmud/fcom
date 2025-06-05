// Email Service: Sends invoice link via Gmail API (spam-safe)
import { google } from 'googleapis';

export async function sendInvoiceEmail({
  to,
  customerName = '',
  invoiceNumber = '',
  companyName = '',
  invoiceLink = '',
  oauth2,
  subject: customSubject,
  html: customHtml,
  text: customText,
}) {
  try {
    // Set up OAuth2 client
    const oAuth2Client = new google.auth.OAuth2(
      oauth2.clientId,
      oauth2.clientSecret,
      oauth2.redirectUri || 'https://developers.google.com/oauthplayground'
    );
    oAuth2Client.setCredentials({ refresh_token: oauth2.refreshToken });
    console.log('[GMAIL API] OAuth2 client set up for user:', oauth2.user);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Use custom subject/html/text if provided, else fallback to invoice template
    const subject = customSubject || `Your Invoice #${invoiceNumber} from ${companyName}`;
    const text = customText || `Dear ${customerName},\n\nThank you for your business. You can view your invoice at: ${invoiceLink}\n\nBest regards,\n${companyName}`;
    const html = customHtml || `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice Email</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f4f4f9;
      color: #333;
      line-height: 1.6;
      padding: 20px;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      text-align: center;
      padding: 20px;
    }
    .header h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin: 0;
    }
    .content {
      padding: 30px;
    }
    .content p {
      font-size: 1rem;
      margin-bottom: 20px;
      color: #444;
    }
    .invoice-link {
      display: inline-block;
      padding: 12px 24px;
      background: #667eea;
      color: #ffffff;
      text-decoration: none;
      border-radius: 4px;
      font-weight: 500;
      transition: background 0.3s ease;
    }
    .invoice-link:hover {
      background: #5a67d8;
    }
    .footer {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-top: 1px solid #eee;
      font-size: 0.9rem;
      color: #666;
    }
    .footer p {
      margin: 0;
    }
    @media (max-width: 600px) {
      .content {
        padding: 20px;
      }
      .header h1 {
        font-size: 1.25rem;
      }
      .invoice-link {
        padding: 10px 20px;
        font-size: 0.9rem;
      }
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      <h1>Your Invoice from ${companyName}</h1>
    </div>
    <div class="content">
      <p>Dear ${customerName},</p>
      <p>Thank you for choosing ${companyName}. We appreciate your business.</p>
      <p>Please find your invoice details below. Click the button to view or download your invoice:</p>
      <p><a href="${invoiceLink}" class="invoice-link">View Invoice #${invoiceNumber}</a></p>
    </div>
    <div class="footer">
      <p>Best regards,<br>${companyName}</p>
    </div>
  </div>
</body>
</html>`;


    // Create email body (RFC 5322)
    const messageParts = [
      `From: ${companyName} <${oauth2.user}>`,
      `To: ${to}`,
      `Reply-To: ${oauth2.user}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=UTF-8',
      '',
      html,
    ];
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    console.log('[GMAIL API] Sending email to:', to);
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });
    console.log('[GMAIL API] Email sent successfully to:', to);
  } catch (err) {
    console.error('[GMAIL API] Failed to send email:', err);
    throw err;
  }
}
