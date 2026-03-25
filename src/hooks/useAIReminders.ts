import { useEffect, useRef } from 'react';
import { useModules } from '../contexts/ModuleContext';
import { useNotifications } from '../contexts/NotificationContext';

export function useAIReminders() {
  const { modules } = useModules();
  const { addNotification, notifications } = useNotifications();
  const hasRun = useRef(false);

  useEffect(() => {
    // Only run once per session/load to avoid spamming
    if (hasRun.current) return;
    
    const checkPendingTasks = async () => {
      const pendingTasks = modules.flatMap(m => m.tasks).filter(t => !t.completed);
      
      if (pendingTasks.length > 0) {
        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [
                {
                  role: 'system',
                  content: `You are an AI assistant for a productivity app called "Level Up". 
                  The user has ${pendingTasks.length} pending tasks. 
                  Tasks include: ${pendingTasks.slice(0, 3).map(t => t.title).join(', ')}.
                  Generate a short, powerful motivational quote and a gentle reminder to complete their tasks.
                  Keep it under 100 characters for the quote and 100 characters for the reminder.
                  Format: Quote | Reminder`
                }
              ],
              model: 'llama-3.3-70b-versatile'
            })
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server Error: ${response.status}`);
          }

          const data = await response.json();
          if (!data.choices || !data.choices[0]) throw new Error('Invalid response from AI');
          
          const text = data.choices[0].message.content || "Keep pushing forward! | You have tasks waiting for you.";
          const [quote, reminder] = text.split('|').map((s: string) => s.trim());

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
