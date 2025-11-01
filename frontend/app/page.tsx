"use client";

import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import EmailCheckerForm from "./components/EmailCheckerForm";
import DeliveryFlowChart from "./components/DeliveryFlowChart";

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
  const uniqueId = uuidv4();
  setTargetEmail(`incoming-${uniqueId}@${process.env.NEXT_PUBLIC_MAILGUN_DOMAIN}`);
  setTargetSubject(`ESP-Check-${uniqueId}`);
}, []);


  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BACKEND_URL}/email`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data: EmailData[] = await response.json();
        setEmails(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmails();
    const interval = setInterval(fetchEmails, 10000);
    return () => clearInterval(interval);
  }, [BACKEND_URL]);

  if (error)
    return <div className="container text-red-500">Error: {error}</div>;

  return (
    <div className="container">
      <h1 className="text-4xl font-bold header mb-6">
        Email ESP & Receiving Chain Analyzer
      </h1>

      <EmailCheckerForm targetEmail={targetEmail} targetSubject={targetSubject} />

      <h2 className="text-2xl font-semibold header mb-4">Processed Emails:</h2>
      {loading ? (
        <p>Loading...</p>
      ) : emails.length === 0 ? (
        <p>No emails processed yet. Send a test email!</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {emails.map((email) => (
            <DeliveryFlowChart key={email._id} email={email} />
          ))}
        </div>
      )}
    </div>
  );
}
