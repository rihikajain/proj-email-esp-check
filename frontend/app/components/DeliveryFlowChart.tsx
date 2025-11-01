interface EmailData {
  _id: string;
  messageId: string;
  sender: string;
  recipient: string;
  subject: string;
  receivingChain: string[];
  espType: string;
  receivedAt: string;
}

export default function DeliveryFlowChart({ email }: { email: EmailData }) {
  return (
    <div className="card">
      <h3 className="text-xl font-bold header mb-2">
        Subject: {email.subject}
      </h3>
      <p><strong>From:</strong> {email.sender}</p>
      <p><strong>To:</strong> {email.recipient}</p>
      <p><strong>Received At:</strong> {new Date(email.receivedAt).toLocaleString()}</p>

      <p className="text-secondary font-bold text-lg mt-4">
        ESP Type: {email.espType || "Unknown"}
      </p>

      <div className="mt-4">
        <h4 className="font-semibold mb-2">Receiving Chain:</h4>
        <ol className="list-decimal list-inside text-sm text-gray-700">
          {email.receivingChain?.length ? (
            email.receivingChain.map((step, i) => <li key={i}>{step}</li>)
          ) : (
            <li>No receiving chain data available.</li>
          )}
        </ol>
      </div>
    </div>
  );
}
