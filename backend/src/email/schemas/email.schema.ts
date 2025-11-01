import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Email extends Document {
  @Prop() messageId: string;
  @Prop() sender: string;
  @Prop() recipient: string;
  @Prop() subject: string;
  @Prop() espType: string;
  @Prop({ type: Object }) rawHeaders: Record<string, any>;
}

export const EmailSchema = SchemaFactory.createForClass(Email);
