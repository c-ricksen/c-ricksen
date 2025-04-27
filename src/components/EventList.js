import React from 'react';
import './EventList.css';

/**
 * EventList component - Displays a list of events from Google Calendar
 * 
 * @param {Array} events - Array of event objects from Google Calendar API
 */
const EventList = ({ events }) => {
  // Format date to display in a user-friendly way
  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time to display in a user-friendly way
  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get formatted time range for an event
  const getEventTimeRange = (event) => {
    // Handle all-day events
    if (event.start.date) {
      return 'All day';
    }

    const startTime = formatEventTime(event.start.dateTime);
    const endTime = formatEventTime(event.end.dateTime);
    
    // Check if event spans multiple days
    const startDate = new Date(event.start.dateTime).toDateString();
    const endDate = new Date(event.end.dateTime).toDateString();
    
    if (startDate !== endDate) {
      return `${formatEventDate(event.start.dateTime)}, ${startTime} - 
              ${formatEventDate(event.end.dateTime)}, ${endTime}`;
    }
    
    return `${startTime} - ${endTime}`;
  };

  // Get event color based on colorId
  const getEventColor = (colorId) => {
    const colors = {
      '1': '#4285f4', // Blue
      '2': '#0f9d58', // Green
      '3': '#f4b400', // Yellow
      '4': '#db4437', // Red
      '5': '#673ab7', // Purple
      '6': '#ff9800', // Orange
      '7': '#795548', // Brown
      '8': '#009688', // Teal
      '9': '#e91e63', // Pink
      '10': '#607d8b', // Blue Grey
      'default': '#4285f4' // Default blue
    };
    
    return colors[colorId] || colors.default;
  };

  // Check if the event is happening now
  const isEventNow = (event) => {
    const now = new Date();
    const start = new Date(event.start.dateTime || event.start.date);
    const end = new Date(event.end.dateTime || event.end.date);
    
    return now >= start && now <= end;
  };

  // Group events by date
  const groupEventsByDate = () => {
    const groupedEvents = {};
    
    events.forEach(event => {
      const dateKey = event.start.dateTime 
        ? new Date(event.start.dateTime).toDateString()
        : new Date(event.start.date).toDateString();
      
      if (!groupedEvents[dateKey]) {
        groupedEvents[dateKey] = [];
      }
      
      groupedEvents[dateKey].push(event);
    });
    
    return groupedEvents;
  };

  // Sort dates chronologically
  const sortDates = (dates) => {
    return dates.sort((a, b) => new Date(a) - new Date(b));
  };

  const groupedEvents = groupEventsByDate();
  const sortedDates = sortDates(Object.keys(groupedEvents));

  // Render empty state if no events
  if (events.length === 0) {
    return (
      <div className="event-list-empty">
        <div className="empty-icon">📅</div>
        <p>No upcoming events found</p>
        <p className="empty-subtext">Events you create or receive will appear here</p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      {sortedDates.map(dateKey => (
        <div key={dateKey} className="event-date-group">
          <div className="event-date-header">
            {formatEventDate(dateKey)}
          </div>
          <ul className="event-list">
            {groupedEvents[dateKey].map((event, index) => (
              <li 
                key={event.id || index} 
                className={`event-item ${isEventNow(event) ? 'event-now' : ''}`}
              >
                <div 
                  className="event-color-indicator" 
                  style={{ backgroundColor: getEventColor(event.colorId) }}
                />
                <div className="event-content">
                  <div className="event-title">{event.summary || 'Untitled Event'}</div>
                  <div className="event-time">{getEventTimeRange(event)}</div>
                  {event.location && (
                    <div className="event-location">
                      <span className="location-icon">📍</span> {event.location}
                    </div>
                  )}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="event-attendees">
                      <span className="attendees-count">
                        {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default EventList;
