"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

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

export default function Home() {
  const [targetEmail, setTargetEmail] = useState("");
  const [targetSubject, setTargetSubject] = useState("");
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

  useEffect(() => {
    // Generate a unique email address and subject line
    const uniqueId = uuidv4();
    setTargetEmail(`incoming-${uniqueId}@YOUR_MAILGUN_DOMAIN`); // Replace with your Mailgun domain
    setTargetSubject(`ESP-Check-${uniqueId}`);
  }, []);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/email`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: EmailData[] = await response.json();
        setEmails(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
    const interval = setInterval(fetchEmails, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }, [BACKEND_URL]);

  if (error)
    return <div className="container text-red-500">Error: {error}</div>;

  return (
    <div className="container">
      <h1 className="text-4xl font-bold header">
        Email ESP & Receiving Chain Analyzer
      </h1>

      <div className="card mb-8">
        <h2 className="text-2xl font-semibold header">How to Test:</h2>
        <p className="mb-2">Send an email to the following address:</p>
        <p className="text-primary font-mono bg-gray-100 p-2 rounded-md inline-block mb-4">
          {targetEmail}
        </p>
        <p className="mb-2">With the exact subject line:</p>
        <p className="text-primary font-mono bg-gray-100 p-2 rounded-md inline-block">
          {targetSubject}
        </p>
        <p className="mt-4 text-sm text-gray-600">
          (Note: Replace `YOUR_MAILGUN_DOMAIN` in the email address with your
          actual Mailgun domain, e.g., `mg.yourdomain.com`).
        </p>
      </div>

      <h2 className="text-2xl font-semibold header mb-4">Processed Emails:</h2>

      {emails.length === 0 ? (
        <p>No emails processed yet. Send a test email!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {emails.map((email) => (
            <div key={email._id} className="card">
              <h3 className="text-xl font-bold header mb-2">
                Subject: {email.subject}
              </h3>
              <p className="mb-1">
                <strong>From:</strong> {email.sender}
              </p>
              <p className="mb-1">
                <strong>To:</strong> {email.recipient}
              </p>
              <p className="mb-1">
                <strong>Received At:</strong>{" "}
                {new Date(email.receivedAt).toLocaleString()}
              </p>
              <p className="text-secondary font-bold text-lg mt-4">
                ESP Type: {email.espType || "Unknown"}
              </p>

              <div className="mt-4">
                <h4 className="font-semibold mb-2">Receiving Chain:</h4>
                <ol className="list-decimal list-inside text-sm text-gray-700">
                  {email.receivingChain && email.receivingChain.length > 0 ? (
                    email.receivingChain.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))
                  ) : (
                    <li>No receiving chain data available.</li>
                  )}
                </ol>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
