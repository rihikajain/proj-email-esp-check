import { Controller, Post, Body, Req, Res, HttpStatus, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { createHmac } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { simpleParser } from 'mailparser';

@Controller('email')
export class EmailController {
  constructor(
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  @Post('webhook')
  async handleIncomingEmail(@Req() req: Request, @Res() res: Response) {
    const mailgunApiKey = this.configService.get<string>('MAILGUN_API_KEY');
    const mailgunDomain = this.configService.get<string>('MAILGUN_DOMAIN');

    if (!mailgunApiKey || !mailgunDomain) {
      console.error('MAILGUN_API_KEY or MAILGUN_DOMAIN is not set in environment variables.');
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Server configuration error.');
    }

    const { signature, 'event-data': eventData, 'body-mime': bodyMime, recipient, sender, subject, 'Message-Id': messageId } = req.body;

    // Validate Mailgun webhook signature
    const hmac = createHmac('sha256', mailgunApiKey);
    hmac.update(signature.timestamp + signature.token);
    const calculatedSignature = hmac.digest('hex');

    if (calculatedSignature !== signature.signature) {
      console.warn('Invalid Mailgun webhook signature.');
      return res.status(HttpStatus.FORBIDDEN).send('Invalid signature.');
    }

    try {
      const parsed = await simpleParser(bodyMime);
      const headers = {};
      parsed.headers.forEach((value, key) => {
        headers[key] = value;
      });

      const createEmailDto: CreateEmailDto = {
        messageId: messageId,
        sender: sender,
        recipient: recipient,
        subject: subject,
        headers: headers,
        receivingChain: [], // Will be populated in a later step
        espType: '', // Will be populated in a later step
        receivedAt: new Date(eventData.timestamp * 1000),
        rawMailgunData: req.body,
        html: parsed.html || parsed.textAsHtml || '', // Capture HTML or text as HTML
      };

      await this.emailService.create(createEmailDto);
      console.log('Email successfully processed and saved.');
      res.status(HttpStatus.OK).send('Webhook received and processed successfully.');
    } catch (error) {
      console.error('Error processing email webhook:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Error processing email.');
    }
  }

  @Get()
  async findAll() {
    return this.emailService.findAll();
  }
}


