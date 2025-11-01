interface Props {
  targetEmail: string;
  targetSubject: string;
}

export default function EmailCheckerForm({ targetEmail, targetSubject }: Props) {
  return (
    <div className="card mb-8">
      <h2 className="text-2xl font-semibold header mb-2">How to Test:</h2>
      <p className="mb-2">Send an email to the following address:</p>
      <p className="text-primary font-mono bg-gray-100 p-2 rounded-md inline-block mb-4">
        {targetEmail || "Generating..."}
      </p>
      <p className="mb-2">With the exact subject line:</p>
      <p className="text-primary font-mono bg-gray-100 p-2 rounded-md inline-block">
        {targetSubject || "Generating..."}
      </p>
      <p className="mt-4 text-sm text-gray-600">
        (Note: Replace <code>YOUR_MAILGUN_DOMAIN</code> with your actual Mailgun domain.)
      </p>
    </div>
  );
}
