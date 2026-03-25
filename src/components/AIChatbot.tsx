import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useModules } from '../contexts/ModuleContext';
import { useCalendar } from '../contexts/CalendarContext';
import { useNotifications } from '../contexts/NotificationContext';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

export default function AIChatbot() {
  const { modules, addTask, updateTask, deleteTask, addModule, deleteModule } = useModules();
  const { events, addEvent, deleteEvent, updateEvent } = useCalendar();
  const { addNotification } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am Level Up, your AI assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: React.FormEvent, customInput?: string) => {
    if (e) e.preventDefault();
    const messageText = customInput || input.trim();
    if (!messageText || isLoading) return;

    if (!process.env.GEMINI_API_KEY) {
      setMessages(prev => [...prev, { role: 'user', content: messageText }, { role: 'assistant', content: 'Error: GEMINI_API_KEY is missing. Please add it to your environment variables.' }]);
      if (!customInput) setInput('');
      return;
    }

    if (!customInput) setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', content: messageText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const systemPrompt = `You are Level Up, a professional and highly capable personal growth assistant.
Your goal is to help users manage their learning modules, tasks, and calendar.

Current App State:
- Modules: ${JSON.stringify(modules.map(m => ({ id: m.id, title: m.title, tasks: m.tasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })) })), null, 2)}
- Calendar Events: ${JSON.stringify(events)}

Instructions:
1. When a user wants to learn something new (e.g., "I want to master React"), use 'add_module' and generate a DETAILED learning path (at least 5-7 steps) as the 'tasks' parameter.
2. When a user wants to add a task, use 'add_task'. If they don't specify a module, pick the most relevant one from the list above.
3. When a user wants to complete a task, use 'update_task'.
4. When a user wants to add a new module, use 'add_module'.
5. When a user wants to schedule something or set a session (like "set a deep work session for 2 PM today"), use 'add_calendar_event'.
6. Today's date is ${new Date().toISOString().split('T')[0]}.
7. If the user asks for motivation or if you notice many pending tasks, use 'add_notification' to send a powerful motivational message. This message MUST:
   - Mention specific pending tasks or calendar events.
   - Include a motivational quote from a famous person (Millionaire, Billionaire, or Buddha) in English.
   - Be highly encouraging and professional.
8. Be concise, encouraging, and professional.
9. If you perform an action using a tool, confirm it to the user in a natural way.

Example: If a user says "I want to master React", you MUST generate a full learning path (e.g., Intro, JSX, Hooks, State, API, Deployment) and add it as a module.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          ...newMessages.map(m => ({ 
            role: m.role === 'assistant' ? 'model' : 'user', 
            parts: [{ text: m.content }] 
          }))
        ],
        config: {
          tools: [{
            functionDeclarations: [
              {
                name: 'add_task',
                description: 'Add a new task to a specific module.',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: {
                    moduleId: { type: 'STRING' as any, description: 'The ID of the module to add the task to.' },
                    title: { type: 'STRING' as any, description: 'The title of the task.' },
                    icon: { type: 'STRING' as any, description: 'A Material Symbols icon name for the task (e.g., "edit", "code", "mic").' }
                  },
                  required: ['moduleId', 'title']
                }
              },
              {
                name: 'update_task',
                description: 'Update an existing task (e.g., mark as completed).',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: {
                    moduleId: { type: 'STRING' as any, description: 'The ID of the module containing the task.' },
                    taskId: { type: 'STRING' as any, description: 'The ID of the task to update.' },
                    completed: { type: 'BOOLEAN' as any, description: 'Whether the task is completed.' }
                  },
                  required: ['moduleId', 'taskId', 'completed']
                }
              },
              {
                name: 'delete_task',
                description: 'Delete a task from a module.',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: {
                    moduleId: { type: 'STRING' as any, description: 'The ID of the module containing the task.' },
                    taskId: { type: 'STRING' as any, description: 'The ID of the task to delete.' }
                  },
                  required: ['moduleId', 'taskId']
                }
              },
              {
                name: 'add_module',
                description: 'Add a new learning or productivity module with an optional detailed learning path (tasks).',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: {
                    title: { type: 'STRING' as any, description: 'The title of the module.' },
                    icon: { type: 'STRING' as any, description: 'A Material Symbols icon name for the module.' },
                    color: { type: 'STRING' as any, description: 'The theme color (violet, blue, green, orange).' },
                    tasks: {
                      type: 'ARRAY' as any,
                      items: {
                        type: 'OBJECT' as any,
                        properties: {
                          title: { type: 'STRING' as any, description: 'The title of the learning step/task.' },
                          icon: { type: 'STRING' as any, description: 'Icon for the task.' }
                        },
                        required: ['title', 'icon']
                      },
                      description: 'A list of initial tasks that form a learning path for this module.'
                    }
                  },
                  required: ['title', 'icon', 'color']
                }
              },
              {
                name: 'add_notification',
                description: 'Send a motivational notification to the user.',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: {
                    title: { type: 'STRING' as any, description: 'The title of the notification.' },
                    message: { type: 'STRING' as any, description: 'The motivational message including pending tasks and a quote.' }
                  },
                  required: ['title', 'message']
                }
              },
              {
                name: 'delete_module',
                description: 'Delete an entire module and all its tasks.',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: {
                    moduleId: { type: 'STRING' as any, description: 'The ID of the module to delete.' }
                  },
                  required: ['moduleId']
                }
              },
              {
                name: 'add_calendar_event',
                description: 'Add an event or session to the calendar.',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: {
                    title: { type: 'STRING' as any, description: 'The event title (e.g., "Deep Work Session").' },
                    module: { type: 'STRING' as any, description: 'The module name this belongs to.' },
                    sub: { type: 'STRING' as any, description: 'A sub-category or specific topic.' },
                    color: { type: 'STRING' as any, description: 'The theme color (violet, blue, green, orange).' },
                    date: { type: 'STRING' as any, description: 'The date in YYYY-MM-DD format.' },
                    time: { type: 'STRING' as any, description: 'The time in HH:MM format (optional).' }
                  },
                  required: ['title', 'module', 'sub', 'color', 'date']
                }
              },
              {
                name: 'delete_calendar_event',
                description: 'Remove an event from the calendar.',
                parameters: {
                  type: 'OBJECT' as any,
                  properties: {
                    eventId: { type: 'STRING' as any, description: 'The ID of the event to delete.' }
                  },
                  required: ['eventId']
                }
              }
            ]
          }]
        }
      });

      const functionCalls = response.functionCalls;
      if (functionCalls) {
        for (const call of functionCalls) {
          const { name, args } = call;

          if (name === 'add_task') {
            const targetModuleId = (args as any).moduleId || modules[0]?.id;
            if (targetModuleId) {
              addTask(targetModuleId, { title: (args as any).title, icon: (args as any).icon || 'task', progress: 0, completed: false });
            }
          } else if (name === 'update_task') {
            updateTask((args as any).moduleId, (args as any).taskId, { completed: (args as any).completed });
          } else if (name === 'delete_task') {
            deleteTask((args as any).moduleId, (args as any).taskId);
          } else if (name === 'add_module') {
            addModule({
              title: (args as any).title,
              icon: (args as any).icon,
              color: (args as any).color,
              bgFrom: `from-${(args as any).color}-500`,
              bgTo: `to-${(args as any).color}-400`,
              progress: 0,
              tasks: (args as any).tasks?.map((t: any) => ({
                id: 'task-' + Math.random().toString(36).substr(2, 9),
                title: t.title,
                icon: t.icon,
                progress: 0,
                completed: false
              })) || []
            });
          } else if (name === 'add_notification') {
            addNotification({
              title: (args as any).title,
              message: (args as any).message,
              type: 'motivation'
            });
          } else if (name === 'delete_module') {
            deleteModule((args as any).moduleId);
          } else if (name === 'add_calendar_event') {
            addEvent({
              title: (args as any).title,
              module: (args as any).module,
              sub: (args as any).sub,
              color: (args as any).color as any,
              date: (args as any).date,
              time: (args as any).time
            });
          } else if (name === 'delete_calendar_event') {
            deleteEvent((args as any).eventId);
          }
        }
        
        // After tool calls, we should ideally call the AI again to get a confirmation message
        // For simplicity, we'll just add a confirmation message ourselves or let the AI respond if it has content
        if (response.text) {
          setMessages(prev => [...prev, { role: 'assistant', content: response.text || '' }]);
        } else {
          setMessages(prev => [...prev, { role: 'assistant', content: "Done! I've updated everything for you." }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: response.text || '' }]);
      }
    } catch (error: any) {
      console.error('Error calling AI API:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message || 'Sorry, I encountered an error. Please try again later.'}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerMotivation = () => {
    handleSend(undefined, "Give me some motivation based on my pending tasks and schedule.");
  };

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        drag
        dragConstraints={{ left: -window.innerWidth + 80, right: 0, top: -window.innerHeight + 80, bottom: 0 }}
        dragElastic={0.1}
        dragMomentum={false}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={clsx(
          "fixed bottom-32 right-6 z-40 w-14 h-14 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-colors cursor-grab active:cursor-grabbing",
          isOpen ? "bg-white/10 text-white/50 pointer-events-none" : "bg-violet-500 text-white hover:bg-violet-400"
        )}
      >
        <span className="material-symbols-outlined text-[28px]">smart_toy</span>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-4 z-50 w-[300px] h-[450px] max-h-[60vh] glass-card rounded-[28px] border border-white/10 flex flex-col overflow-hidden shadow-2xl bg-surface-container/95 backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400">
                  <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-xs">Level Up</h3>
                  <p className="text-[9px] text-white/50 uppercase tracking-widest">Assistant</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={triggerMotivation}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-violet-400"
                  title="Get Motivation"
                >
                  <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-white/50 hover:text-white"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={clsx(
                    "flex flex-col max-w-[90%]",
                    msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                  )}
                >
                  <div 
                    className={clsx(
                      "px-3.5 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap",
                      msg.role === 'user' 
                        ? "bg-violet-500 text-white rounded-tr-sm" 
                        : "bg-white/10 text-white/90 rounded-tl-sm border border-white/5"
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto flex flex-col items-start max-w-[90%]">
                  <div className="px-3 py-2 rounded-2xl bg-white/10 rounded-tl-sm border border-white/5 flex gap-1">
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1 h-1 rounded-full bg-white/50" />
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1 h-1 rounded-full bg-white/50" />
                    <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1 h-1 rounded-full bg-white/50" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-white/5">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type here..."
                  className="w-full bg-black/20 border border-white/10 rounded-full pl-4 pr-10 py-2.5 text-[13px] text-white placeholder:text-white/30 focus:outline-none focus:border-violet-500/50 transition-colors"
                />
                <button 
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 w-8 h-8 rounded-full bg-violet-500 flex items-center justify-center text-white disabled:opacity-50 disabled:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
