# Student Events Implementation

This directory contains the implementation for the Student Events view in the VirtuUni Nexus platform.

## Overview

The Student Events feature allows students to:

- View upcoming and past events
- Register for events
- Cancel registrations
- See their registration status
- View capacity information for events

Unlike the administrator view, students cannot create, edit, or delete events.

## Architecture

The implementation consists of the following files:

- `student-events.client.tsx` - Basic component for the student events view
- `student-events-enhanced.client.tsx` - Enhanced version with improved UI/UX (currently in use)
- `mock-events.ts` - Mock data for testing the events functionality without backend dependency

## Mock Data Implementation

The mock data implementation simulates:

1. **Different Event Types**:

   - Upcoming events (various dates)
   - Past events (e.g., Research Symposium)
   - Events requiring approval (e.g., Tech Innovation Workshop)
   - Events with capacity limits (e.g., International Cultural Fair)

2. **Registration States**:

   - Pending registrations (e.g., Tech Innovation Workshop)
   - Approved registrations (e.g., others' registrations for International Cultural Fair)
   - Rejected registrations (e.g., Graduate Student Symposium)
   - Cancelled registrations (e.g., Summer Music Festival)
   - Attended events (e.g., Research Symposium)
   - Full capacity events (International Cultural Fair)

3. **User Actions**:
   - Registration (simulated with delay)
   - Cancellation (simulated with delay)

The mock implementation intercepts calls that would normally go to the backend API and instead operates on local data. This allows for testing the UI and user flows without requiring a running backend.

## Integration with Real Backend

To switch from mock data to real backend:

1. Remove the `useMockEventRegistration` hook
2. Change the event fetching methods to use the real API
3. Remove mock data imports

## Testing

When testing the mock implementation, you can simulate:

- Registering for an event (look for "Tech Innovation Workshop" which requires approval)
- Trying to register for a full event (try "International Cultural Fair")
- Cancelling a registration (if you've registered for any event)
- Viewing past events you've attended (see "Research Symposium")
- View a rejected registration with reason (see "Graduate Student Symposium")
- View a cancelled registration (see "Summer Music Festival")

### Enhanced Features in student-events-enhanced.client.tsx

The enhanced version includes these additional features:

1. **Capacity Indicators**:
   - Visual indicators for events with limited spots remaining (amber text)
   - "Full" indicator for events at capacity (red text)
   - Disabled registration button for full events
2. **Rejected Registration Information**:
   - Shows the reason for rejection in a prominent red message box
3. **Improved Error Handling**:
   - Better error messages when registration/cancellation fails

## Date Reference

The mock data assumes the current date is May 27, 2025 for testing purposes.
