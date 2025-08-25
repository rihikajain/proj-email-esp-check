import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema()
export class Email {
  @Prop({ required: true })
  messageId: string; // Unique ID of the email

  @Prop({ required: true })
  sender: string; // Sender's email address

  @Prop({ required: true })
  recipient: string; // Recipient's email address (our generated address)

  @Prop({ required: true })
  subject: string; // Subject line of the email

  @Prop({ type: Object })
  headers: Record<string, any>; // Raw parsed headers from the email

  @Prop({ type: [String] })
  receivingChain: string[]; // Sequence of servers email passed through

  @Prop()
  espType: string; // Detected Email Service Provider

  @Prop({ default: Date.now })
  receivedAt: Date; // Timestamp when email was received

  @Prop({ type: Object })
  rawMailgunData: Record<string, any>; // Raw data from Mailgun webhook
}

export const EmailSchema = SchemaFactory.createForClass(Email);
