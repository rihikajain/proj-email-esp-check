import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('webhook')
  async processWebhook(@Body() body: any) {
    console.log('📩 Webhook hit:', body);
    await this.emailService.processIncomingWebhook(body);
    return { message: 'Webhook processed successfully ✅' };
  }

  @Get('fetch')
  async fetchEmails(@Query('limit') limit = 10) {
    return this.emailService.fetchAndStoreEmails(Number(limit));
  }

  @Get('all')
  async getEmails(@Query('limit') limit = 10) {
    return this.emailService.getEmails(Number(limit));
  }
}
