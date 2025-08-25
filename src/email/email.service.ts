import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './schemas/email.schema';
import { CreateEmailDto } from './dto/create-email.dto';

@Injectable()
export class EmailService {
  constructor(@InjectModel(Email.name) private emailModel: Model<EmailDocument>) {}

  async create(createEmailDto: CreateEmailDto): Promise<Email> {
    // Extract receiving chain from headers
    createEmailDto.receivingChain = this.extractReceivingChain(createEmailDto.headers);
    // Detect ESP type
    createEmailDto.espType = this.detectEspType(createEmailDto.headers);
    const createdEmail = new this.emailModel(createEmailDto);
    return createdEmail.save();
  }

  private extractReceivingChain(headers: Record<string, any>): string[] {
    const receivedHeaders = headers['received'];

    if (!receivedHeaders) {
      return [];
    }

    const receivedLines = Array.isArray(receivedHeaders) ? receivedHeaders : [receivedHeaders];

    const chain: string[] = [];
    receivedLines.forEach(line => {
      const byMatch = line.match(/by ([^;\s]+)/i);
      const fromMatch = line.match(/from ([^;\s]+)/i);

      if (byMatch && byMatch[1]) {
        chain.push(`Received by: ${byMatch[1]}`);
      } else if (fromMatch && fromMatch[1]) {
        chain.push(`Received from: ${fromMatch[1]}`);
      } else {
        chain.push(line);
      }
    });

    return chain.reverse();
  }

  private detectEspType(headers: Record<string, any>): string {
    // Common headers for ESP detection
    const messageId = headers['message-id'] ? headers['message-id'].toLowerCase() : '';
    const received = headers['received'] ? (Array.isArray(headers['received']) ? headers['received'].join(' ') : headers['received']).toLowerCase() : '';
    const xMailer = headers['x-mailer'] ? headers['x-mailer'].toLowerCase() : '';
    const userAgent = headers['user-agent'] ? headers['user-agent'].toLowerCase() : '';
    const from = headers['from'] ? headers['from'].toLowerCase() : '';

    // Detection rules (can be expanded)
    if (messageId.includes('mail.gmail.com')) {
      return 'Gmail';
    } else if (messageId.includes('mail.outlook.com') || messageId.includes('protection.outlook.com')) {
      return 'Outlook';
    } else if (received.includes('amazonses') || xMailer.includes('amazon ses')) {
      return 'Amazon SES';
    } else if (messageId.includes('zoho.com') || received.includes('zoho.com')) {
      return 'Zoho Mail';
    } else if (received.includes('google.com/smtp')) {
      return 'Google Workspace (SMTP)';
    } else if (xMailer.includes('apple mail') || userAgent.includes('apple mail')) {
      return 'Apple Mail (Client)'; // Often used with various ESPs
    } else if (messageId.includes('sendgrid.net') || received.includes('sendgrid.net')) {
      return 'SendGrid';
    } else if (messageId.includes('mailgun.org') || received.includes('mailgun.org')) {
      return 'Mailgun';
    } else if (messageId.includes('sparkpost') || received.includes('sparkpost')) {
      return 'SparkPost';
    } else if (messageId.includes('mandrillapp.com') || received.includes('mandrillapp.com')) {
      return 'Mandrill';
    } else if (messageId.includes('smtp.com') || received.includes('smtp.com')) {
      return 'SMTP.com';
    } else if (messageId.includes('postmarkapp.com') || received.includes('postmarkapp.com')) {
      return 'Postmark';
    } else if (from.includes('newsletter.co')) {
      return 'Newsletter Service'; // Generic for common newsletter patterns
    }

    return 'Unknown';
  }

  async findAll(): Promise<Email[]> {
    return this.emailModel.find().exec();
  }

  async findOne(id: string): Promise<Email> {
    return this.emailModel.findById(id).exec();
  }
}
