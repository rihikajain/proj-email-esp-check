import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Email extends Document {
  @Prop({ required: true })
  messageId: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  recipient: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ type: [String], default: [] })
  receivingChain: string[];

  @Prop({ required: true })
  espType: string;

  @Prop({ type: Object })
  rawHeaders: any;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
