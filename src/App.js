import React, { useState, useEffect } from 'react';
import { gapi } from 'gapi-script';
import './App.css';

// Components to be created later
import Calendar from './components/Calendar';
import EventForm from './components/EventForm';
import AuthButton from './components/AuthButton';
import EventList from './components/EventList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Google API Client ID - should be stored in environment variables in production
  const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';
  const API_KEY = 'YOUR_GOOGLE_API_KEY';
  const DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
  const SCOPES = 'https://www.googleapis.com/auth/calendar';

  useEffect(() => {
    // Initialize Google API client
    const initClient = () => {
      setIsLoading(true);
      gapi.client.init({
        apiKey: API_KEY,
        clientId: CLIENT_ID,
        discoveryDocs: DISCOVERY_DOCS,
        scope: SCOPES,
      }).then(() => {
        // Listen for sign-in state changes
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        // Handle the initial sign-in state
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        setIsLoading(false);
      }).catch(error => {
        setError(error);
        setIsLoading(false);
      });
    };

    // Load the Google API client script
    gapi.load('client:auth2', initClient);
  }, []);

  // Update state based on authentication status
  const updateSigninStatus = (isSignedIn) => {
    setIsAuthenticated(isSignedIn);
    if (isSignedIn) {
      fetchEvents();
    } else {
      setEvents([]);
    }
  };

  // Handle sign-in
  const handleSignIn = () => {
    gapi.auth2.getAuthInstance().signIn();
  };

  // Handle sign-out
  const handleSignOut = () => {
    gapi.auth2.getAuthInstance().signOut();
  };

  // Fetch events from Google Calendar
  const fetchEvents = () => {
    setIsLoading(true);
    gapi.client.calendar.events.list({
      'calendarId': 'primary',
      'timeMin': (new Date()).toISOString(),
      'showDeleted': false,
      'singleEvents': true,
      'maxResults': 10,
      'orderBy': 'startTime'
    }).then(response => {
      const events = response.result.items;
      setEvents(events);
      setIsLoading(false);
    }).catch(error => {
      setError(error);
      setIsLoading(false);
    });
  };

  // Create a new event
  const createEvent = (event) => {
    setIsLoading(true);
    const googleEvent = {
      'summary': event.title,
      'location': event.location,
      'description': event.description,
      'start': {
        'dateTime': event.start.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'end': {
        'dateTime': event.end.toISOString(),
        'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      'attendees': event.attendees.map(email => ({ 'email': email })),
      'reminders': {
        'useDefault': false,
        'overrides': [
          { 'method': 'email', 'minutes': 24 * 60 },
          { 'method': 'popup', 'minutes': 10 }
        ]
      }
    };

    gapi.client.calendar.events.insert({
      'calendarId': 'primary',
      'resource': googleEvent
    }).then(() => {
      fetchEvents();
      setIsLoading(false);
    }).catch(error => {
      setError(error);
      setIsLoading(false);
    });
  };

  // Handle date selection in calendar
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Calendar App</h1>
        <AuthButton 
          isAuthenticated={isAuthenticated} 
          onSignIn={handleSignIn} 
          onSignOut={handleSignOut} 
        />
      </header>
      
      <main className="app-main">
        {isAuthenticated ? (
          <div className="calendar-container">
            <div className="calendar-view">
              <Calendar 
                events={events} 
                selectedDate={selectedDate} 
                onDateSelect={handleDateSelect} 
              />
            </div>
            <div className="event-panel">
              <h2>Schedule Meeting</h2>
              <EventForm 
                selectedDate={selectedDate} 
                onSubmit={createEvent} 
              />
              <h2>Upcoming Events</h2>
              {isLoading ? (
                <p>Loading events...</p>
              ) : (
                <EventList events={events} />
              )}
              {error && <p className="error">Error: {error.message}</p>}
            </div>
          </div>
        ) : (
          <div className="auth-message">
            <p>Please sign in with your Google account to view and manage your calendar.</p>
          </div>
        )}
      </main>
      
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Calendar App</p>
      </footer>
    </div>
  );
}

export default App;
