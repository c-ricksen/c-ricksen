import React, { useState, useEffect } from 'react';
import './Calendar.css';

const Calendar = ({ events, selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Generate calendar days whenever the current month changes
  useEffect(() => {
    setCalendarDays(generateCalendarDays(currentMonth));
  }, [currentMonth]);

  // Generate an array of days for the calendar
  const generateCalendarDays = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Total days in the month
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Calculate days from previous month to display
    const prevMonthDays = [];
    if (firstDayOfWeek > 0) {
      const prevMonth = new Date(year, month, 0);
      const prevMonthTotalDays = prevMonth.getDate();
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        prevMonthDays.push({
          date: new Date(year, month - 1, prevMonthTotalDays - i),
          isCurrentMonth: false,
          isToday: false
        });
      }
    }
    
    // Current month days
    const currentMonthDays = [];
    const today = new Date();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      currentMonthDays.push({
        date,
        isCurrentMonth: true,
        isToday: 
          date.getDate() === today.getDate() &&
          date.getMonth() === today.getMonth() &&
          date.getFullYear() === today.getFullYear()
      });
    }
    
    // Next month days to fill the remaining cells
    const nextMonthDays = [];
    const totalDaysDisplayed = prevMonthDays.length + currentMonthDays.length;
    const remainingCells = 42 - totalDaysDisplayed; // 6 rows × 7 days = 42 cells
    
    for (let day = 1; day <= remainingCells; day++) {
      nextMonthDays.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false
      });
    }
    
    // Combine all days
    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  };

  // Navigate to the previous month
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  // Navigate to the next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  // Navigate to the current month
  const goToToday = () => {
    setCurrentMonth(new Date());
    onDateSelect(new Date());
  };

  // Check if a day has events
  const hasEvents = (date) => {
    if (!events || events.length === 0) return false;
    
    const dateString = date.toISOString().split('T')[0];
    
    return events.some(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventStartDate = eventStart.toISOString().split('T')[0];
      return eventStartDate === dateString;
    });
  };

  // Get events for a specific day
  const getEventsForDay = (date) => {
    if (!events || events.length === 0) return [];
    
    const dateString = date.toISOString().split('T')[0];
    
    return events.filter(event => {
      const eventStart = new Date(event.start.dateTime || event.start.date);
      const eventStartDate = eventStart.toISOString().split('T')[0];
      return eventStartDate === dateString;
    });
  };

  // Format date to display in the header
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Check if a date is the selected date
  const isSelectedDate = (date) => {
    return date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  // Render event indicators for a day
  const renderEventIndicators = (day) => {
    const dayEvents = getEventsForDay(day.date);
    
    // Show up to 3 event indicators
    const maxIndicators = 3;
    const indicators = dayEvents.slice(0, maxIndicators).map((event, index) => (
      <div 
        key={index} 
        className="event-indicator"
        style={{ backgroundColor: event.colorId ? `var(--event-color-${event.colorId})` : 'var(--event-color-default)' }}
        title={event.summary}
      />
    ));
    
    // If there are more events than we can display, add a "+more" indicator
    if (dayEvents.length > maxIndicators) {
      indicators.push(
        <div key="more" className="event-more">
          +{dayEvents.length - maxIndicators}
        </div>
      );
    }
    
    return indicators;
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button onClick={goToPreviousMonth} className="nav-button">
            &lt;
          </button>
          <h2>{formatMonthYear(currentMonth)}</h2>
          <button onClick={goToNextMonth} className="nav-button">
            &gt;
          </button>
        </div>
        <button onClick={goToToday} className="today-button">
          Today
        </button>
      </div>
      
      <div className="calendar-grid">
        {/* Days of the week */}
        <div className="weekday">Sun</div>
        <div className="weekday">Mon</div>
        <div className="weekday">Tue</div>
        <div className="weekday">Wed</div>
        <div className="weekday">Thu</div>
        <div className="weekday">Fri</div>
        <div className="weekday">Sat</div>
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`calendar-day ${day.isCurrentMonth ? 'current-month' : 'other-month'} 
                       ${day.isToday ? 'today' : ''} 
                       ${isSelectedDate(day.date) ? 'selected' : ''}`}
            onClick={() => onDateSelect(day.date)}
          >
            <div className="day-number">{day.date.getDate()}</div>
            {hasEvents(day.date) && (
              <div className="event-indicators">
                {renderEventIndicators(day)}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;
