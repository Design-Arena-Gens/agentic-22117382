import { NextRequest, NextResponse } from 'next/server';

interface ExtractedEvent {
  title: string;
  description: string;
  startDateTime: string;
  endDateTime: string;
  location?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { event } = await request.json();

    if (!event || !event.title || !event.startDateTime || !event.endDateTime) {
      return NextResponse.json(
        { error: 'Invalid event data' },
        { status: 400 }
      );
    }

    // In production, this would use the Google Calendar API
    // For demo purposes, we'll simulate the API call
    await new Promise(resolve => setTimeout(resolve, 500));

    const calendarEvent = {
      id: `event_${Date.now()}`,
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startDateTime,
        timeZone: 'America/New_York',
      },
      end: {
        dateTime: event.endDateTime,
        timeZone: 'America/New_York',
      },
      location: event.location,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 30 }, // 30 minutes before
        ],
      },
    };

    console.log('Would create calendar event:', calendarEvent);

    return NextResponse.json({
      success: true,
      message: 'Event added to calendar successfully',
      event: calendarEvent,
    });
  } catch (error) {
    console.error('Error adding event to calendar:', error);
    return NextResponse.json(
      { error: 'Failed to add event to calendar' },
      { status: 500 }
    );
  }
}
