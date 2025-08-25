import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import fetch from 'node-fetch';
import { Email } from './schemas/email.schema';

@Injectable()
export class EmailService {
  private readonly apiKey = process.env.MAILGUN_API_KEY;
  private readonly domain = process.env.MAILGUN_DOMAIN;
  private readonly baseUrl =
    process.env.MAILGUN_BASE_URL || 'https://api.mailgun.net/v3';

  async processIncomingWebhook(body: any): Promise<void> {
    // Debug: log the full webhook body
    console.log('Received webhook body:', JSON.stringify(body, null, 2));
    // Support both 'message-headers' (array) and 'message.headers' (object)
    let headersArr = body['message-headers'];
    let headerObj: Record<string, any> = {};
    if (Array.isArray(headersArr)) {
      headerObj = Object.fromEntries(headersArr);
    } else if (body.message && typeof body.message.headers === 'object') {
      headerObj = body.message.headers;
    } else {
      // fallback: try to use all top-level fields as headers
      headerObj = { ...body };
    }
    const receivingChain = this.extractReceivingChain(headerObj);
    const espType = this.detectESP(headerObj);
    const emailDoc = new this.emailModel({
      messageId: headerObj['Message-Id'] || '',
      sender: headerObj['From'] || body.sender || '',
      recipient: headerObj['To'] || body.recipient || '',
      subject: headerObj['Subject'] || body.subject || '',
      receivingChain,
      espType,
      rawHeaders: headerObj,
    });
    await emailDoc.save();
  }

  constructor(@InjectModel(Email.name) private emailModel: Model<Email>) {}

  async fetchAndStoreEmails(limit = 10): Promise<Email[]> {
    if (!this.apiKey || !this.domain) {
      throw new Error('Mailgun credentials not set');
    }
    const url = `${this.baseUrl}/${this.domain}/events?event=stored&limit=${limit}`;
    const response = await fetch(url, {
      headers: {
        Authorization:
          'Basic ' + Buffer.from('api:' + this.apiKey).toString('base64'),
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch emails from Mailgun');
    }
    const data = await response.json();
    const emails: Email[] = [];
    for (const item of data.items || []) {
      // Fetch the full MIME message for each event
      const messageUrl = `${this.baseUrl}/${this.domain}/messages/${item.storage.key}`;
      const msgRes = await fetch(messageUrl, {
        headers: {
          Authorization:
            'Basic ' + Buffer.from('api:' + this.apiKey).toString('base64'),
        },
      });
      if (!msgRes.ok) continue;
      const msgData = await msgRes.json();
      const headers = msgData['message-headers'] || [];
      const headerObj = Object.fromEntries(headers);
      const receivingChain = this.extractReceivingChain(headerObj);
      const espType = this.detectESP(headerObj);
      const emailDoc = new this.emailModel({
        messageId: headerObj['Message-Id'] || '',
        sender: headerObj['From'] || '',
        recipient: headerObj['To'] || '',
        subject: headerObj['Subject'] || '',
        receivingChain,
        espType,
        rawHeaders: headerObj,
      });
      await emailDoc.save();
      emails.push(emailDoc);
    }
    return emails;
  }

  async getEmails(limit = 10): Promise<Email[]> {
    // Optionally, fetch new emails before returning
    await this.fetchAndStoreEmails(limit);
    return this.emailModel.find().sort({ createdAt: -1 }).limit(limit).exec();
  }

  extractReceivingChain(headers: any): string[] {
    // Parse 'Received' headers for the chain
    const receivedHeaders = Object.entries(headers)
      .filter(([k]) => k.toLowerCase() === 'received')
      .map(([, v]) => v);
    // If multiple, flatten
    if (Array.isArray(receivedHeaders[0])) {
      return receivedHeaders[0] as string[];
    }
    return receivedHeaders.map(String);
  }

  detectESP(headers: any): string {
    const from = headers['From'] || '';
    if (/gmail\.com/i.test(from)) return 'Gmail';
    if (/outlook\.com|hotmail\.com|live\.com/i.test(from)) return 'Outlook';
    if (/amazonses\.com/i.test(from)) return 'Amazon SES';
    if (/zoho\.com/i.test(from)) return 'Zoho';
    if (/mailgun\.org/i.test(from)) return 'Mailgun';
    if (/sendgrid\.net/i.test(from)) return 'SendGrid';
    // Add more ESPs as needed
    return 'Unknown';
  }
}
