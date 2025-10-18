import { NextRequest, NextResponse } from 'next/server';

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

// Simple rule-based event extraction (fallback if no OpenAI key)
function extractEventFromEmail(email: Email): ExtractedEvent | null {
  const text = `${email.subject} ${email.body}`.toLowerCase();

  // Check if email contains event-related keywords
  const hasEventKeywords = /meeting|appointment|conference|party|celebration|flight|event|scheduled|reservation/i.test(text);

  if (!hasEventKeywords) {
    return null;
  }

  // Extract date patterns
  const datePatterns = [
    /(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday),?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/gi,
    /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}/gi,
    /\d{1,2}\/\d{1,2}\/\d{4}/g,
  ];

  let dateMatch = null;
  for (const pattern of datePatterns) {
    const match = email.body.match(pattern);
    if (match) {
      dateMatch = match[0];
      break;
    }
  }

  // Extract time patterns
  const timePattern = /\d{1,2}:\d{2}\s*(?:AM|PM|am|pm)/gi;
  const timeMatches = email.body.match(timePattern);

  // Extract location
  const locationPattern = /(?:location|at|venue|address):\s*([^\n]+)/gi;
  const locationMatch = locationPattern.exec(email.body);
  const location = locationMatch ? locationMatch[1].trim() : undefined;

  if (!dateMatch || !timeMatches || timeMatches.length === 0) {
    return null;
  }

  // Parse date and times
  const startTime = timeMatches[0];
  const endTime = timeMatches[1] || startTime;

  // Create datetime strings
  const startDateTime = new Date(`${dateMatch} ${startTime}`).toISOString();
  const endDateTime = new Date(`${dateMatch} ${endTime}`).toISOString();

  return {
    title: email.subject,
    description: email.body.substring(0, 500),
    startDateTime,
    endDateTime,
    location,
  };
}

// AI-powered extraction using OpenAI (if API key is available)
async function extractEventWithAI(email: Email): Promise<ExtractedEvent | null> {
  const openaiKey = process.env.OPENAI_API_KEY;

  if (!openaiKey || openaiKey === 'your_openai_key_here') {
    // Fallback to rule-based extraction
    return extractEventFromEmail(email);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an AI assistant that extracts event details from emails. If the email contains event information (meeting, appointment, flight, party, etc.), extract the title, description, start date/time, end date/time, and location. Return a JSON object with these fields, or null if no event is found. Use ISO 8601 format for dates.'
          },
          {
            role: 'user',
            content: `Email Subject: ${email.subject}\n\nEmail Body:\n${email.body}\n\nExtract event details as JSON.`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.statusText);
      return extractEventFromEmail(email);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return extractEventFromEmail(email);
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const extracted = JSON.parse(jsonMatch[0]);
      if (extracted && extracted.title && extracted.startDateTime) {
        return extracted;
      }
    }

    return extractEventFromEmail(email);
  } catch (error) {
    console.error('AI extraction error:', error);
    return extractEventFromEmail(email);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json(
        { error: 'Invalid request: emails array required' },
        { status: 400 }
      );
    }

    // Extract events from each email
    const emailsWithEvents = await Promise.all(
      emails.map(async (email: Email) => {
        const extractedEvent = await extractEventWithAI(email);
        return {
          ...email,
          extractedEvent,
        };
      })
    );

    // Filter out emails without events
    const emailsWithValidEvents = emailsWithEvents.filter(e => e.extractedEvent !== null);

    return NextResponse.json({
      emailsWithEvents: emailsWithValidEvents,
      message: `Extracted ${emailsWithValidEvents.length} events from ${emails.length} emails`,
    });
  } catch (error) {
    console.error('Error extracting events:', error);
    return NextResponse.json(
      { error: 'Failed to extract events' },
      { status: 500 }
    );
  }
}
