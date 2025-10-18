import { NextResponse } from 'next/server';

// Mock email data with event-related content
const mockEmails = [
  {
    id: '1',
    subject: 'Team Meeting - Project Kickoff',
    snippet: 'Hi team, We have our project kickoff meeting scheduled for next Monday at 2:00 PM in Conference Room A. Please bring your laptops...',
    body: `Hi team,

We have our project kickoff meeting scheduled for next Monday, December 23rd, 2025 at 2:00 PM in Conference Room A. The meeting will last approximately 2 hours until 4:00 PM.

Please bring your laptops and any questions you have about the project scope.

Looking forward to seeing everyone there!

Best regards,
Sarah`
  },
  {
    id: '2',
    subject: 'Dentist Appointment Confirmation',
    snippet: 'Your appointment has been confirmed for Thursday, December 26th at 10:30 AM. Please arrive 10 minutes early...',
    body: `Dear Patient,

Your appointment has been confirmed for:

Date: Thursday, December 26th, 2025
Time: 10:30 AM - 11:30 AM
Location: Smile Dental Clinic, 123 Main Street, Suite 200

Please arrive 10 minutes early to complete any necessary paperwork.

If you need to reschedule, please call us at (555) 123-4567.

Best regards,
Smile Dental Clinic`
  },
  {
    id: '3',
    subject: 'Annual Company Holiday Party',
    snippet: 'Join us for our annual holiday celebration on Friday, December 27th at 6:00 PM at the Grand Ballroom...',
    body: `Dear Team,

You're invited to our Annual Company Holiday Party!

📅 Date: Friday, December 27th, 2025
🕕 Time: 6:00 PM - 11:00 PM
📍 Location: Grand Ballroom, Downtown Plaza Hotel

Enjoy dinner, drinks, music, and great company! Business casual attire.

Please RSVP by December 20th.

Cheers,
HR Team`
  },
  {
    id: '4',
    subject: 'Flight Confirmation - NYC to LAX',
    snippet: 'Your flight is confirmed. Departure: December 30th at 8:45 AM from JFK Airport...',
    body: `Flight Confirmation

Booking Reference: ABC123XYZ

Outbound Flight:
Date: Monday, December 30th, 2025
Departure: 8:45 AM from JFK Airport (New York)
Arrival: 12:15 PM at LAX Airport (Los Angeles)
Flight: AA 1234

Please arrive at the airport at least 2 hours before departure.

Safe travels!`
  },
  {
    id: '5',
    subject: 'Weekly Newsletter - No Events',
    snippet: 'Check out this week\'s top stories and updates from around the company...',
    body: `Weekly Newsletter

Here are this week's highlights:
- New product features launched
- Employee spotlight on John Doe
- Company metrics update

Stay tuned for more updates!`
  }
];

export async function GET() {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      emails: mockEmails,
      message: 'Successfully fetched emails (demo data)'
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}
