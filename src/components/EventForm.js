import React, { useState, useEffect } from 'react';
import './EventForm.css';

const EventForm = ({ selectedDate, onSubmit }) => {
  // Initialize form state with default values
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    start: new Date(selectedDate),
    end: new Date(selectedDate),
    attendees: [''],
  });

  const [errors, setErrors] = useState({});

  // Update form when selected date changes
  useEffect(() => {
    // Set default times: start at next hour, end 1 hour later
    const startDate = new Date(selectedDate);
    startDate.setHours(startDate.getHours() + 1, 0, 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setHours(endDate.getHours() + 1);
    
    setFormData(prevData => ({
      ...prevData,
      start: startDate,
      end: endDate
    }));
  }, [selectedDate]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
    
    // Clear error for this field when user edits it
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  // Handle date/time changes
  const handleDateTimeChange = (e) => {
    const { name, value } = e.target;
    const [datePart, timePart] = value.split('T');
    
    if (name === 'start' || name === 'end') {
      const newDate = new Date(`${datePart}T${timePart || '00:00'}`);
      
      setFormData(prevData => ({
        ...prevData,
        [name]: newDate
      }));
      
      // If start time is changed, ensure end time is after start time
      if (name === 'start' && newDate > formData.end) {
        const newEndDate = new Date(newDate);
        newEndDate.setHours(newEndDate.getHours() + 1);
        
        setFormData(prevData => ({
          ...prevData,
          end: newEndDate
        }));
      }
    }
  };

  // Handle attendee changes
  const handleAttendeeChange = (index, value) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = value;
    
    setFormData(prevData => ({
      ...prevData,
      attendees: newAttendees
    }));
  };

  // Add a new attendee field
  const addAttendee = () => {
    setFormData(prevData => ({
      ...prevData,
      attendees: [...prevData.attendees, '']
    }));
  };

  // Remove an attendee field
  const removeAttendee = (index) => {
    const newAttendees = [...formData.attendees];
    newAttendees.splice(index, 1);
    
    setFormData(prevData => ({
      ...prevData,
      attendees: newAttendees
    }));
  };

  // Format date for datetime-local input
  const formatDateTimeForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Validate form before submission
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.end < formData.start) {
      newErrors.end = 'End time must be after start time';
    }
    
    // Validate email format for attendees
    formData.attendees.forEach((email, index) => {
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors[`attendee${index}`] = 'Invalid email format';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty attendee emails
      const filteredAttendees = formData.attendees.filter(email => email.trim() !== '');
      
      onSubmit({
        ...formData,
        attendees: filteredAttendees
      });
      
      // Reset form after submission
      setFormData({
        title: '',
        description: '',
        location: '',
        start: new Date(selectedDate),
        end: new Date(selectedDate),
        attendees: [''],
      });
    }
  };

  return (
    <form className="event-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className={errors.title ? 'error' : ''}
          placeholder="Meeting title"
        />
        {errors.title && <span className="error-message">{errors.title}</span>}
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Meeting details"
          rows="3"
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Meeting location or video call link"
        />
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="start">Start Time *</label>
          <input
            type="datetime-local"
            id="start"
            name="start"
            value={formatDateTimeForInput(formData.start)}
            onChange={handleDateTimeChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="end">End Time *</label>
          <input
            type="datetime-local"
            id="end"
            name="end"
            value={formatDateTimeForInput(formData.end)}
            onChange={handleDateTimeChange}
            className={errors.end ? 'error' : ''}
          />
          {errors.end && <span className="error-message">{errors.end}</span>}
        </div>
      </div>
      
      <div className="form-group">
        <label>Attendees</label>
        {formData.attendees.map((attendee, index) => (
          <div key={index} className="attendee-row">
            <input
              type="email"
              value={attendee}
              onChange={(e) => handleAttendeeChange(index, e.target.value)}
              placeholder="Email address"
              className={errors[`attendee${index}`] ? 'error' : ''}
            />
            {formData.attendees.length > 1 && (
              <button 
                type="button" 
                className="remove-attendee"
                onClick={() => removeAttendee(index)}
              >
                ✕
              </button>
            )}
            {errors[`attendee${index}`] && (
              <span className="error-message">{errors[`attendee${index}`]}</span>
            )}
          </div>
        ))}
        <button 
          type="button" 
          className="add-attendee"
          onClick={addAttendee}
        >
          + Add Attendee
        </button>
      </div>
      
      <div className="form-actions">
        <button type="submit" className="btn-primary">
          Create Event
        </button>
      </div>
    </form>
  );
};

export default EventForm;
