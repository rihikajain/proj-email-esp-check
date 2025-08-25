import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Req,
  Res,
  HttpCode,
} from '@nestjs/common';
import { EmailService } from './email.service';
import type { Response, Request } from 'express';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async findAll(@Query('limit') limit?: string) {
    return this.emailService.getEmails(Number(limit) || 10);
  }

  // Mailgun webhook endpoint
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Body() body: any,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      // Mailgun sends MIME as 'body-mime' or parsed fields
      await this.emailService.processIncomingWebhook(body);
      return res.status(200).json({ message: 'Webhook received' });
    } catch (err) {
      return res
        .status(500)
        .json({ message: 'Webhook error', error: err.message });
    }
  }
}
