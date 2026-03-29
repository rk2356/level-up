import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from './AuthContext';

export interface Task {
  id: string;
  title: string;
  icon: string;
  progress: number;
  completed?: boolean;
  date?: string; // YYYY-MM-DD
  time?: string; // 12h format e.g. "10:30 AM"
  day?: string; // e.g. "Wednesday"
  module_id?: string; // Optional for standalone tasks
  answer?: string; // For syllabus topics
  type?: 'task' | 'unit' | 'topic' | 'semester'; // To distinguish
  parent_id?: string; // For hierarchy
  pdf_url?: string; // For PDF storage
}

export interface Module {
  id: string;
  title: string;
  icon: string;
  progress: number;
  color: string;
  bgFrom: string;
  bgTo: string;
  streak: string;
  tasks: Task[];
  isSyllabus?: boolean;
}

const today = new Date().toISOString().split('T')[0];
const currentDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
const currentTime = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

const defaultModules: Module[] = [
  {
    id: 'content-creator',
    title: 'Content Creator',
    icon: 'videocam',
    progress: 0,
    color: 'violet',
    bgFrom: 'from-primary',
    bgTo: 'to-violet-400',
    streak: '14 day streak 🔥',
    tasks: [
      { id: 'cc-task1', title: 'Story Script', icon: 'edit_document', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
      { id: 'cc-task2', title: 'Dialogues Writing', icon: 'record_voice_over', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
      { id: 'cc-task3', title: 'Voice Generation', icon: 'mic', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
      { id: 'cc-task4', title: 'Image Generation', icon: 'image', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
      { id: 'cc-task5', title: 'Sfx Generation', icon: 'graphic_eq', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
      { id: 'cc-task6', title: 'Bgm Generation', icon: 'music_note', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
      { id: 'cc-task7', title: 'Video Editting', icon: 'movie_edit', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
    ]
  },
  {
    id: 'bsc-studies',
    title: 'B.Sc Studies',
    icon: 'auto_stories',
    progress: 0,
    color: 'blue',
    bgFrom: 'from-blue-500',
    bgTo: 'to-cyan-400',
    streak: '12 day streak 🔥',
    tasks: [
      { id: 'bsc-task1', title: 'Zoology', icon: 'pets', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
      { id: 'bsc-task2', title: 'Botany', icon: 'local_florist', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
      { id: 'bsc-task3', title: 'Chemistry', icon: 'science', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
    ]
  },
  {
    id: 'english',
    title: 'English Speaking',
    icon: 'record_voice_over',
    progress: 66,
    color: 'green',
    bgFrom: 'from-emerald-500',
    bgTo: 'to-teal-400',
    streak: '4 day streak 🔥',
    tasks: [
      { id: 'eng-task1', title: 'Grammar Practice', icon: 'spellcheck', progress: 1, completed: true, date: today, day: currentDay, time: currentTime },
      { id: 'eng-task2', title: 'Vocabulary', icon: 'translate', progress: 1, completed: true, date: today, day: currentDay, time: currentTime },
      { id: 'eng-task3', title: 'Speaking Session', icon: 'mic', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
    ]
  },
  {
    id: 'software-dev',
    title: 'Software Developer',
    icon: 'terminal',
    progress: 66,
    color: 'orange',
    bgFrom: 'from-orange-500',
    bgTo: 'to-amber-400',
    streak: '21 day streak 🔥',
    tasks: [
      { id: 'sd-task1', title: 'React Components', icon: 'code', progress: 1, completed: true, date: today, day: currentDay, time: currentTime },
      { id: 'sd-task2', title: 'API Integration', icon: 'api', progress: 1, completed: true, date: today, day: currentDay, time: currentTime },
      { id: 'sd-task3', title: 'Database Design', icon: 'database', progress: 0, completed: false, date: today, day: currentDay, time: currentTime },
    ]
  }
];

interface ModuleContextType {
  modules: Module[];
  todoTasks: Task[];
  loading: boolean;
  addModule: (module: Omit<Module, 'id' | 'streak'>) => Promise<void>;
  updateModule: (id: string, updates: Partial<Module>) => Promise<void>;
  deleteModule: (id: string) => Promise<void>;
  deleteTask: (moduleId: string, taskId: string) => Promise<void>;
  addTask: (moduleId: string, task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (moduleId: string, taskId: string, updates: Partial<Task>) => Promise<void>;
  addTodoTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTodoTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTodoTask: (id: string) => Promise<void>;
}

const ModuleContext = createContext<ModuleContextType>({
  modules: [],
  todoTasks: [],
  loading: true,
  addModule: async () => {},
  updateModule: async () => {},
  deleteModule: async () => {},
  deleteTask: async () => {},
  addTask: async () => {},
  updateTask: async () => {},
  addTodoTask: async () => {},
  updateTodoTask: async () => {},
  deleteTodoTask: async () => {}
});

import { BSC_ZOOLOGY_SYLLABUS } from '../constants/syllabus';

export const ModuleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Module[]>([]);
  const [todoTasks, setTodoTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial Fetch
  useEffect(() => {
    if (!user) {
      setModules([]);
      setTodoTasks([]);
      setLoading(false);
      return;
    }

    if (!isSupabaseConfigured) {
      setModules(defaultModules);
      setTodoTasks([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch modules
        const { data: modulesData, error: modulesError } = await supabase
          .from('modules')
          .select('*')
          .eq('user_id', user.id);

        if (modulesError) throw modulesError;

        // Fetch module tasks
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id);

        if (tasksError) throw tasksError;

        // Fetch standalone todo tasks
        const { data: todoData, error: todoError } = await supabase
          .from('todo_tasks')
          .select('*')
          .eq('user_id', user.id);

        // If table doesn't exist, we'll just have an empty array for now
        // In a real app, we'd handle this more gracefully
        const formattedTodoTasks = todoError ? [] : todoData.map(t => ({
          id: t.id,
          title: t.title,
          icon: t.icon,
          progress: t.progress,
          completed: t.completed,
          date: t.date,
          time: t.time,
          day: t.day
        }));
        setTodoTasks(formattedTodoTasks);

        if (modulesData.length === 0) {
          console.log('No modules found in Supabase, seeding default data...');
          // Seed default data for new user
          await seedDefaultData(user.id);
        } else {
          console.log(`Found ${modulesData.length} modules in Supabase.`);
          const formattedModules = modulesData.map(m => {
            // Robust check for isSyllabus
            const isSyllabus = m.is_syllabus || m.icon === 'auto_stories' || m.icon === 'book';
            
            return {
              id: m.id,
              title: m.title,
              icon: m.icon,
              progress: m.progress,
              color: m.color,
              bgFrom: m.bg_from,
              bgTo: m.bg_to,
              streak: m.streak,
              isSyllabus: isSyllabus,
              tasks: tasksData
                .filter(t => t.module_id === m.id)
                .map(t => ({
                  id: t.id,
                  title: t.title,
                  icon: t.icon,
                  progress: t.progress,
                  completed: t.completed,
                  date: t.date,
                  time: t.time,
                  day: t.day,
                  answer: t.answer,
                  type: t.type,
                  parent_id: t.parent_id,
                  pdf_url: t.pdf_url
                }))
            };
          });
          setModules(formattedModules);
        }
      } catch (error) {
        console.error('Error fetching data from Supabase:', error);
        setModules(defaultModules);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const seedDefaultData = async (userId: string) => {
    try {
      for (const m of defaultModules) {
        const { error: mError } = await supabase.from('modules').insert({
          id: m.id,
          user_id: userId,
          title: m.title,
          icon: m.icon,
          progress: m.progress,
          color: m.color,
          bg_from: m.bgFrom,
          bg_to: m.bgTo,
          streak: m.streak
        });

        if (mError) throw mError;

        const tasksToInsert = m.tasks.map(t => ({
          id: t.id,
          user_id: userId,
          module_id: m.id,
          title: t.title,
          icon: t.icon,
          progress: t.progress,
          completed: t.completed,
          date: t.date,
          time: t.time,
          day: t.day
        }));

        const { error: tError } = await supabase.from('tasks').insert(tasksToInsert);
        if (tError) throw tError;
      }
      setModules(defaultModules);
    } catch (error) {
      console.error('Error seeding default data:', error);
      setModules(defaultModules);
    }
  };

  const addModule = async (module: Omit<Module, 'id' | 'streak'>) => {
    const id = module.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    const isSyllabus = module.icon === 'auto_stories' || module.icon === 'book';
    
    const newModule: Module = {
      ...module,
      id,
      tasks: [],
      streak: '0 day streak',
      isSyllabus
    };

    if (!user || !isSupabaseConfigured) {
      setModules(prev => [...prev, newModule]);
      return;
    }

    try {
      await supabase.from('modules').insert({
        id: newModule.id,
        user_id: user.id,
        title: newModule.title,
        icon: newModule.icon,
        progress: newModule.progress,
        color: newModule.color,
        bg_from: newModule.bgFrom,
        bg_to: newModule.bgTo,
        streak: newModule.streak,
        is_syllabus: newModule.isSyllabus
      });

      setModules(prev => [...prev, newModule]);
    } catch (error) {
      console.error('Error adding module:', error);
    }
  };

  const updateModule = async (id: string, updates: Partial<Module>) => {
    if (!user || !isSupabaseConfigured) {
      return;
    }
    try {
      const dbUpdates: any = {};
      if (updates.title) dbUpdates.title = updates.title;
      if (updates.icon) dbUpdates.icon = updates.icon;
      if (updates.progress !== undefined) dbUpdates.progress = updates.progress;
      if (updates.color) dbUpdates.color = updates.color;
      if (updates.bgFrom) dbUpdates.bg_from = updates.bgFrom;
      if (updates.bgTo) dbUpdates.bg_to = updates.bgTo;
      if (updates.streak) dbUpdates.streak = updates.streak;

      await supabase.from('modules').update(dbUpdates).eq('id', id).eq('user_id', user.id);
      setModules(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
    } catch (error) {
      console.error('Error updating module:', error);
    }
  };

  const deleteModule = async (id: string) => {
    if (!user || !isSupabaseConfigured) {
      return;
    }
    try {
      await supabase.from('tasks').delete().eq('module_id', id).eq('user_id', user.id);
      await supabase.from('modules').delete().eq('id', id).eq('user_id', user.id);
      setModules(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting module:', error);
    }
  };

  const deleteTask = async (moduleId: string, taskId: string) => {
    if (!user || !isSupabaseConfigured) {
      return;
    }
    try {
      const module = modules.find(m => m.id === moduleId);
      if (!module) return;

      const tasksToDelete = [taskId];
      
      // If it's a syllabus module, find all children recursively
      if (module.isSyllabus) {
        const findChildren = (pid: string) => {
          const children = module.tasks.filter(t => t.parent_id === pid);
          children.forEach(c => {
            tasksToDelete.push(c.id);
            findChildren(c.id);
          });
        };
        findChildren(taskId);
      }

      // Delete associated PDFs from storage
      const tasksWithPdfs = module.tasks.filter(t => tasksToDelete.includes(t.id) && t.pdf_url);
      for (const t of tasksWithPdfs) {
        if (t.pdf_url) {
          // Extract file path from URL (assuming it's in the 'syllabus-pdfs' bucket)
          const parts = t.pdf_url.split('/');
          const fileName = parts[parts.length - 1];
          if (fileName) {
            await supabase.storage.from('syllabus-pdfs').remove([fileName]);
          }
        }
      }

      // Delete from Supabase
      await supabase.from('tasks').delete().in('id', tasksToDelete).eq('user_id', user.id);
      
      setModules(prev => prev.map(m => {
        if (m.id === moduleId) {
          const newTasks = m.tasks.filter(t => !tasksToDelete.includes(t.id));
          
          let newProgress = 0;
          if (m.isSyllabus) {
            const topics = newTasks.filter(t => t.type === 'topic');
            const completedTopics = topics.filter(t => t.completed).length;
            newProgress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;
          } else {
            const completedTasks = newTasks.filter(t => t.completed).length;
            newProgress = newTasks.length > 0 ? Math.round((completedTasks / newTasks.length) * 100) : 0;
          }
          
          // Update module progress in DB
          updateModule(moduleId, { progress: newProgress });
          
          return { ...m, tasks: newTasks, progress: newProgress };
        }
        return m;
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addTask = async (moduleId: string, task: Omit<Task, 'id'>) => {
    const now = new Date();
    const taskId = 'task-' + Date.now();
    const newTask: Task = {
      ...task,
      id: taskId,
      date: task.date || now.toISOString().split('T')[0],
      day: task.day || now.toLocaleDateString('en-US', { weekday: 'long' }),
      time: task.time || now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };

    if (!user || !isSupabaseConfigured) {
      return;
    }

    try {
      await supabase.from('tasks').insert({
        id: newTask.id,
        user_id: user.id,
        module_id: moduleId,
        title: newTask.title,
        icon: newTask.icon,
        progress: newTask.progress,
        completed: newTask.completed,
        date: newTask.date,
        time: newTask.time,
        day: newTask.day,
        type: newTask.type || 'task',
        parent_id: newTask.parent_id,
        answer: newTask.answer,
        pdf_url: newTask.pdf_url
      });

      setModules(prev => prev.map(m => {
        if (m.id === moduleId) {
          const newTasks = [...m.tasks, newTask];
          const completedTasks = newTasks.filter(t => t.completed).length;
          const newProgress = newTasks.length > 0 ? Math.round((completedTasks / newTasks.length) * 100) : 0;
          
          updateModule(moduleId, { progress: newProgress });
          
          return { ...m, tasks: newTasks, progress: newProgress };
        }
        return m;
      }));
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const updateTask = async (moduleId: string, taskId: string, updates: Partial<Task>) => {
    if (!user || !isSupabaseConfigured) {
      return;
    }
    try {
      console.log(`Updating task ${taskId} in module ${moduleId}...`, updates);
      const { error } = await supabase.from('tasks').update(updates).eq('id', taskId).eq('user_id', user.id);
      
      if (error) {
        console.error('Supabase updateTask error:', error);
        throw error;
      }

      console.log('Task updated successfully in Supabase');
      setModules(prev => prev.map(m => {
        if (m.id === moduleId) {
          const newTasks = m.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
          
          let newProgress = 0;
          if (m.isSyllabus) {
            const topics = newTasks.filter(t => t.type === 'topic');
            const completedTopics = topics.filter(t => t.completed).length;
            newProgress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;
          } else {
            const completedTasks = newTasks.filter(t => t.completed).length;
            newProgress = newTasks.length > 0 ? Math.round((completedTasks / newTasks.length) * 100) : 0;
          }
          
          updateModule(moduleId, { progress: newProgress });
          
          return { ...m, tasks: newTasks, progress: newProgress };
        }
        return m;
      }));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const addTodoTask = async (task: Omit<Task, 'id'>) => {
    const now = new Date();
    const taskId = 'todo-' + Date.now();
    const newTask: Task = {
      ...task,
      id: taskId,
      date: task.date || now.toISOString().split('T')[0],
      day: task.day || now.toLocaleDateString('en-US', { weekday: 'long' }),
      time: task.time || now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };

    if (!user || !isSupabaseConfigured) {
      setTodoTasks(prev => [...prev, newTask]);
      return;
    }

    try {
      await supabase.from('todo_tasks').insert({
        id: newTask.id,
        user_id: user.id,
        title: newTask.title,
        icon: newTask.icon,
        progress: newTask.progress,
        completed: newTask.completed,
        date: newTask.date,
        time: newTask.time,
        day: newTask.day
      });
      setTodoTasks(prev => [...prev, newTask]);
    } catch (error) {
      console.error('Error adding todo task:', error);
      // Fallback to local state if table doesn't exist
      setTodoTasks(prev => [...prev, newTask]);
    }
  };

  const updateTodoTask = async (id: string, updates: Partial<Task>) => {
    if (!user || !isSupabaseConfigured) {
      setTodoTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
      return;
    }
    try {
      await supabase.from('todo_tasks').update(updates).eq('id', id).eq('user_id', user.id);
      setTodoTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    } catch (error) {
      console.error('Error updating todo task:', error);
      setTodoTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    }
  };

  const deleteTodoTask = async (id: string) => {
    if (!user || !isSupabaseConfigured) {
      setTodoTasks(prev => prev.filter(t => t.id !== id));
      return;
    }
    try {
      await supabase.from('todo_tasks').delete().eq('id', id).eq('user_id', user.id);
      setTodoTasks(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting todo task:', error);
      setTodoTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  return (
    <ModuleContext.Provider value={{ 
      modules, 
      todoTasks, 
      loading, 
      addModule, 
      updateModule, 
      deleteModule, 
      deleteTask, 
      addTask, 
      updateTask,
      addTodoTask,
      updateTodoTask,
      deleteTodoTask
    }}>
      {children}
    </ModuleContext.Provider>
  );
};

export const useModules = () => useContext(ModuleContext);


