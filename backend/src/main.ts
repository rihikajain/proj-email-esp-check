import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend & production URLs
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-frontend.vercel.app',
    ],
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    credentials: true,
  });

  // Log Mailgun & MongoDB vars for debugging
  console.log('MAILGUN_API_KEY:', process.env.MAILGUN_API_KEY);
  console.log('MAILGUN_DOMAIN:', process.env.MAILGUN_DOMAIN);
  console.log('MAILGUN_BASE_URL:', process.env.MAILGUN_BASE_URL);
  console.log('MONGODB_URI:', process.env.MONGODB_URI);

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}
bootstrap();
