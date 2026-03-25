import { useEffect, useRef } from 'react';
import { useModules } from '../contexts/ModuleContext';
import { useNotifications } from '../contexts/NotificationContext';
import { GoogleGenAI } from "@google/genai";

export function useAIReminders() {
  const { modules } = useModules();
  const { addNotification, notifications } = useNotifications();
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run once per session/load to avoid spamming
    if (hasRun.current) return;
    
    const checkPendingTasks = async () => {
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY is missing. AI reminders disabled.");
        return;
      }
      
      const pendingTasks = modules.flatMap(m => m.tasks).filter(t => !t.completed);
      
      if (pendingTasks.length > 0) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
          const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `You are an AI assistant for a productivity app called "Level Up". 
            The user has ${pendingTasks.length} pending tasks. 
            Tasks include: ${pendingTasks.slice(0, 3).map(t => t.title).join(', ')}.
            Generate a short, powerful motivational quote and a gentle reminder to complete their tasks.
            Keep it under 100 characters for the quote and 100 characters for the reminder.
            Format: Quote | Reminder`,
          });

          const text = response.text || "Keep pushing forward! | You have tasks waiting for you.";
          const [quote, reminder] = text.split('|').map(s => s.trim());

          // Check if we already sent a reminder recently (e.g., last 1 hour)
          const lastReminder = notifications.find(n => n.type === 'motivation');
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          
          if (!lastReminder || new Date(lastReminder.timestamp) < oneHourAgo) {
            addNotification({
              title: "AI Reminder: Level Up!",
              message: `${quote}\n\n${reminder}`,
              type: 'motivation'
            });
          }
          
          hasRun.current = true;
        } catch (error) {
          console.error("AI Reminder Error:", error);
        }
      }
    };

    // Delay slightly to ensure context is loaded
    const timer = setTimeout(checkPendingTasks, 3000);
    return () => clearTimeout(timer);
  }, [modules, addNotification, notifications]);
}
