import { NextResponse } from 'next/server';
import { transaction } from '@/lib/db/mysql';
import { ResultSetHeader, FieldPacket } from 'mysql2';

const expectedKey = 'suddenkey'; // Set your secret key here

// Function to log messages (replacing PHP's file-based logging with console.log)
function logMessage(message: string) {
  console.log(`${new Date().toISOString()} - ${message}`);
}

// Function to extract data from the message (same regex logic as PHP)
function extractData(message: string, timestamp: string) {
  const data: { [key: string]: string } = { stored_data_timestamp: timestamp };

  // Extract text_company
  const textCompanyMatch = message.match(/From : ([^\n]+)\n/);
  data.text_company = textCompanyMatch ? textCompanyMatch[1] : '';
  logMessage(`Extracted text company: ${data.text_company}`);

  // Extract amount
  const amountMatch = message.match(/received Tk ([\d,\.]+)/);
  data.amount = amountMatch ? amountMatch[1].replace(/,/g, '') : '';
  logMessage(`Extracted amount: ${data.amount}`);

  // Extract sender
  const senderMatch = message.match(/from (\d+)/);
  data.sender = senderMatch ? senderMatch[1] : '';
  logMessage(`Extracted sender: ${data.sender}`);

  // Extract transaction ID
  const trxIdMatch = message.match(/TrxID ([A-Z0-9]+)/);
  data.TrxID = trxIdMatch ? trxIdMatch[1] : '';
  logMessage(`Extracted TrxID: ${data.TrxID}`);

  // Extract payment time
  const paymentTimeMatch = message.match(/at ([\d\/\s:]+)/);
  data.payment_time = paymentTimeMatch ? paymentTimeMatch[1] : '';
  logMessage(`Extracted payment time: ${data.payment_time}`);

  return data;
}

export async function POST(request: Request) {
  logMessage('Received POST request');

  try {
    // Parse x-www-form-urlencoded body
    const bodyText = await request.text();
    const params = new URLSearchParams(bodyText);
    const formData: { [key: string]: string } = {};
    params.forEach((value, key) => {
      formData[key] = value;
    });
    logMessage(`POST data: ${JSON.stringify(formData, null, 2)}`);

    // Handle key fallback logic (same as PHP)
    let finalKey = formData['key'] || '';
    let finalMessage = formData['message'] || '';

    if (!finalKey) {
      finalKey = 'suddenkey';
      finalMessage = formData['suddenkey'] || '';
    }

    logMessage(`Key: ${finalKey}`);
    logMessage(`Message: ${finalMessage}`);

    if (finalKey !== expectedKey) {
      logMessage('Invalid key');
      return NextResponse.json({ message: 'Invalid key' }, { status: 401 });
    }

    // Get current timestamp in Asia/Dhaka (same as PHP)
    const timestamp = new Date().toLocaleString('en-GB', {
      timeZone: 'Asia/Dhaka',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    }).replace(',', '');

    logMessage(`Timestamp: ${timestamp}`);

    // Extract data from message
    const data = extractData(finalMessage, timestamp);
    logMessage(`Extracted data: ${JSON.stringify(data, null, 2)}`);

    // Insert data into the database using the same transaction function
    const result = await transaction(async (connection) => {
      logMessage('Connected to database successfully');

      const [insertResult]: [ResultSetHeader, FieldPacket[]] = await connection.execute(
        `INSERT INTO stored_data (stored_data_timestamp, text_company, amount, sender, TrxID, payment_time) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          data.stored_data_timestamp,
          data.text_company,
          data.amount,
          data.sender,
          data.TrxID,
          data.payment_time,
        ]
      );

      if (insertResult.affectedRows > 0) {
        logMessage('Message saved to database successfully');
        return { success: true };
      } else {
        logMessage('Failed to write message to database');
        throw new Error('Failed to write message to database');
      }
    });

    logMessage('Database updated successfully');
    return NextResponse.json({ message: 'Message saved successfully' });
  } catch (error: any) {
    logMessage(`Error: ${error.message}`);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  logMessage(`Invalid request method: GET`);
  return NextResponse.json({ message: 'Invalid request method' }, { status: 405 });
}