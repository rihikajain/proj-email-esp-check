import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI || '', {
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          console.log('✅ Connected to MongoDB Atlas successfully!');
        });
        connection.on('error', (err) => {
          console.error('❌ MongoDB Connection Error:', err);
        });
        return connection;
      },
    }),
    EmailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor() {
    console.log('✅ AppModule initialized');
  }
}
