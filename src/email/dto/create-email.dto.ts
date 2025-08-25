export class CreateEmailDto {
  messageId: string;
  sender: string;
  recipient: string;
  subject: string;
  headers: Record<string, any>;
  receivingChain: string[];
  espType: string;
  receivedAt: Date;
  rawMailgunData: Record<string, any>;
}
