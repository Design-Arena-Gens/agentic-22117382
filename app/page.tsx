'use client';

import { useState } from 'react';

interface Email {
  id: string;
  subject: string;
  snippet: string;
  body: string;
}

interface ExtractedEvent {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}

interface EmailWithEvent extends Email {
  extractedEvent?: ExtractedEvent;
  addedToCalendar?: boolean;
}

export default function Home() {
  const [emails, setEmails] = useState<EmailWithEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/auth/google');
      const data = await response.json();

      if (data.authUrl) {
        window.location.href = data.authUrl;
      }
    } catch (err) {
      setError('Failed to authenticate with Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/gmail/fetch');
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        if (data.error.includes('not authenticated')) {
          setAuthenticated(false);
        }
        return;
      }

      setAuthenticated(true);
      setEmails(data.emails || []);
    } catch (err) {
      setError('Failed to fetch emails');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const extractEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/extract-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setEmails(data.emailsWithEvents || []);
    } catch (err) {
      setError('Failed to extract events');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addToCalendar = async (emailId: string, event: ExtractedEvent) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/calendar/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setEmails(prev => prev.map(email =>
        email.id === emailId ? { ...email, addedToCalendar: true } : email
      ));
    } catch (err) {
      setError('Failed to add event to calendar');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            📧 Gmail Calendar Agent
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Automatically extract event details from your emails and add them to your calendar
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {!authenticated && (
              <button
                onClick={handleAuth}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:transform-none"
              >
                {loading ? 'Connecting...' : '🔐 Connect Gmail & Calendar'}
              </button>
            )}

            {authenticated && (
              <>
                <button
                  onClick={fetchEmails}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                >
                  {loading ? 'Fetching...' : '📬 Fetch Recent Emails'}
                </button>

                {emails.length > 0 && !emails.some(e => e.extractedEvent) && (
                  <button
                    onClick={extractEvents}
                    disabled={loading}
                    className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-3 px-8 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105 disabled:transform-none"
                  >
                    {loading ? 'Extracting...' : '🤖 Extract Events with AI'}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {emails.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              📨 Emails with Potential Events
            </h2>

            {emails.map((email) => (
              <div
                key={email.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {email.subject}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                  {email.snippet}
                </p>

                {email.extractedEvent && (
                  <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
                      📅 Extracted Event Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-medium">Title:</span> {email.extractedEvent.title}</p>
                      <p><span className="font-medium">Start:</span> {new Date(email.extractedEvent.startDateTime).toLocaleString()}</p>
                      <p><span className="font-medium">End:</span> {new Date(email.extractedEvent.endDateTime).toLocaleString()}</p>
                      {email.extractedEvent.location && (
                        <p><span className="font-medium">Location:</span> {email.extractedEvent.location}</p>
                      )}
                      <p><span className="font-medium">Description:</span> {email.extractedEvent.description}</p>
                    </div>

                    {!email.addedToCalendar ? (
                      <button
                        onClick={() => addToCalendar(email.id, email.extractedEvent!)}
                        disabled={loading}
                        className="mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition-all duration-200"
                      >
                        {loading ? 'Adding...' : '➕ Add to Calendar'}
                      </button>
                    ) : (
                      <div className="mt-4 inline-flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
                        ✅ Added to Calendar
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {authenticated && emails.length === 0 && !loading && (
          <div className="text-center text-gray-500 dark:text-gray-400 py-12">
            <p className="text-lg">No emails found. Click "Fetch Recent Emails" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
