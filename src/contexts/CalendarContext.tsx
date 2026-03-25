import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CalendarEvent {
  id: string;
  title: string;
  module: string;
  sub: string;
  color: 'violet' | 'blue' | 'green' | 'orange';
  date: string; // ISO date string (YYYY-MM-DD)
  time?: string; // e.g., "14:00"
}

interface CalendarContextType {
  events: CalendarEvent[];
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
}

const CalendarContext = createContext<CalendarContextType>({
  events: [],
  addEvent: () => {},
  deleteEvent: () => {},
  updateEvent: () => {}
});

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => {
    const saved = localStorage.getItem('levelup_calendar');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('levelup_calendar', JSON.stringify(events));
  }, [events]);

  const addEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: 'event-' + Date.now()
    };
    setEvents(prev => [...prev, newEvent]);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  return (
    <CalendarContext.Provider value={{ events, addEvent, deleteEvent, updateEvent }}>
      {children}
    </CalendarContext.Provider>
  );
};

export const useCalendar = () => useContext(CalendarContext);
