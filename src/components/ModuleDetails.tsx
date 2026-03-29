import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';
import { useModules } from '../contexts/ModuleContext';
import { supabase } from '../lib/supabase';

export default function ModuleDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { modules, updateModule, deleteTask, updateTask, addTask } = useModules();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskIcon, setNewTaskIcon] = useState('check_circle');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [topicAnswer, setTopicAnswer] = useState('');
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});
  const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});
  
  const [addingSyllabusType, setAddingSyllabusType] = useState<'semester' | 'unit' | 'topic' | null>(null);
  const [syllabusParentId, setSyllabusParentId] = useState<string | null>(null);
  const [editingSyllabusId, setEditingSyllabusId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<string | null>(null);
  const [isDeletingPdf, setIsDeletingPdf] = useState<string | null>(null);
  const [viewingPdfUrl, setViewingPdfUrl] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const moduleInfo = id ? modules.find(m => m.id === id) : null;

  // Clear notification after 3 seconds
  React.useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!moduleInfo) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold mb-4">Module not found</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-primary text-on-primary rounded-full"
        >
          Go Back Home
        </button>
      </div>
    );
  }

  const toggleTask = (taskId: string) => {
    if (!moduleInfo) return;
    
    const updatedTasks = moduleInfo.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    const completedCount = updatedTasks.filter(t => t.completed).length;
    const newProgress = updatedTasks.length > 0 
      ? Math.round((completedCount / updatedTasks.length) * 100) 
      : 0;

    updateModule(moduleInfo.id, {
      tasks: updatedTasks,
      progress: newProgress
    });
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && moduleInfo) {
      if (moduleInfo.isSyllabus && addingSyllabusType) {
        const taskData: any = {
          title: newTaskTitle.trim(),
          icon: addingSyllabusType === 'semester' ? 'school' : addingSyllabusType === 'unit' ? 'folder' : 'description',
          progress: 0,
          completed: false,
          type: addingSyllabusType,
          parent_id: syllabusParentId
        };
        
        if (addingSyllabusType === 'topic') taskData.answer = '';
        
        addTask(moduleInfo.id, taskData);
        
        setAddingSyllabusType(null);
        setSyllabusParentId(null);
      } else {
        const newTask = {
          title: newTaskTitle.trim(),
          icon: newTaskIcon,
          progress: 0,
          completed: false,
          type: 'task' as const
        };
        
        addTask(moduleInfo.id, newTask);
      }
      
      setIsAddingTask(false);
      setNewTaskTitle('');
      setNewTaskIcon('check_circle');
    }
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim() && moduleInfo) {
      const taskId = isEditingTask || editingSyllabusId;
      if (taskId) {
        updateTask(moduleInfo.id, taskId, {
          title: newTaskTitle.trim(),
          icon: newTaskIcon
        });
        setIsEditingTask(null);
        setEditingSyllabusId(null);
        setNewTaskTitle('');
        setNewTaskIcon('check_circle');
      }
    }
  };

  const openSyllabusAddModal = (type: 'semester' | 'unit' | 'topic', parentId: string | null = null) => {
    setAddingSyllabusType(type);
    setSyllabusParentId(parentId);
    setNewTaskTitle('');
    setIsAddingTask(true);
  };

  const openSyllabusEditModal = (e: React.MouseEvent, task: any) => {
    e.preventDefault();
    e.stopPropagation();
    setNewTaskTitle(task.title);
    setNewTaskIcon(task.icon);
    setEditingSyllabusId(task.id);
    setIsEditingTask(task.id); // Reuse the same modal state
    setActiveMenu(null);
  };

  const openEditModal = (e: React.MouseEvent, task: any) => {
    e.preventDefault();
    e.stopPropagation();
    setNewTaskTitle(task.title);
    setNewTaskIcon(task.icon);
    setIsEditingTask(task.id);
    setActiveMenu(null);
  };

  const handleDeleteTask = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteTask(moduleInfo.id, taskId);
    setActiveMenu(null);
  };

  const toggleMenu = (e: React.MouseEvent, taskId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(activeMenu === taskId ? null : taskId);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>, unitId: string) => {
    const file = e.target.files?.[0];
    console.log('handlePdfUpload called', { file, unitId, moduleInfoId: moduleInfo?.id });
    
    if (!file || !moduleInfo) {
      console.warn('File or moduleInfo missing');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      setNotification({ text: 'File size must be less than 100MB', type: 'error' });
      return;
    }

    if (file.type !== 'application/pdf') {
      setNotification({ text: 'Please upload a PDF file', type: 'error' });
      return;
    }

    setIsUploading(unitId);
    try {
      console.log('Starting upload to storage...');
      
      // Check authentication
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('You must be logged in to upload files.');
      }

      // Sanitize filename: keep only alphanumeric, dots, dashes, and underscores
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const fileName = `${Date.now()}-${sanitizedName}`;
      
      const { data, error } = await supabase.storage
        .from('syllabus-pdfs')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        if (error.message.includes('bucket not found')) {
          throw new Error('Storage bucket "syllabus-pdfs" not found. Please create it in Supabase dashboard.');
        }
        throw error;
      }

      console.log('Upload successful, getting public URL...', data);
      const { data: { publicUrl } } = supabase.storage
        .from('syllabus-pdfs')
        .getPublicUrl(fileName);

      console.log('Public URL:', publicUrl);
      await updateTask(moduleInfo.id, unitId, { pdf_url: publicUrl });
      console.log('Task updated with PDF URL');
      setNotification({ text: 'PDF uploaded successfully!', type: 'success' });
    } catch (error: any) {
      console.error('Error uploading PDF:', error);
      setNotification({ text: `Failed to upload PDF: ${error.message || 'Unknown error'}`, type: 'error' });
    } finally {
      setIsUploading(null);
      setActiveMenu(null);
      // Reset input value so same file can be uploaded again if needed
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  const handleDeletePdf = async (e: React.MouseEvent, unit: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!moduleInfo || !unit.pdf_url) return;
    
    setIsDeletingPdf(unit.id);
    try {
      // Extract filename correctly from Supabase URL
      const parts = unit.pdf_url.split('/');
      const fileName = parts[parts.length - 1];
      
      if (fileName) {
        const { error: storageError } = await supabase.storage.from('syllabus-pdfs').remove([fileName]);
        if (storageError) {
          console.error('Supabase storage delete error:', storageError);
        }
      }
      
      await updateTask(moduleInfo.id, unit.id, { pdf_url: null });
      setNotification({ text: 'PDF deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting PDF:', error);
      setNotification({ text: 'Failed to delete PDF', type: 'error' });
    } finally {
      setIsDeletingPdf(null);
      setActiveMenu(null);
    }
  };

  const openTopicDetail = (task: any) => {
    setSelectedTopicId(task.id);
    setTopicAnswer(task.answer || '');
  };

  const handleSaveAnswer = () => {
    if (selectedTopicId && moduleInfo) {
      const isCompleted = topicAnswer.trim().length > 0;
      updateTask(moduleInfo.id, selectedTopicId, { 
        answer: topicAnswer,
        completed: isCompleted 
      });
      setSelectedTopicId(null);
    }
  };

  const toggleUnit = (unitId: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitId]: !prev[unitId] }));
  };

  const toggleSemester = (semId: string) => {
    setExpandedSemesters(prev => ({ ...prev, [semId]: !prev[semId] }));
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const taskIcons = ['check_circle', 'book', 'edit', 'code', 'build', 'lightbulb', 'schedule', 'flag'];

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => setActiveMenu(null)}
    >
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={clsx(
              "fixed top-6 left-1/2 -translate-x-1/2 z-[110] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border backdrop-blur-md",
              notification.type === 'success' ? "bg-green-500/20 border-green-500/20 text-green-400" : "bg-error/20 border-error/20 text-error"
            )}
          >
            <span className="material-symbols-outlined">
              {notification.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span className="font-bold text-sm">{notification.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="bg-transparent w-full pt-8 pb-4 px-8 z-50 sticky top-0 backdrop-blur-md">
        <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
          <Link to="/" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface text-[28px]">chevron_left</span>
          </Link>
          <h1 className="font-headline font-bold tracking-tight text-[22px] text-on-surface uppercase">{moduleInfo.title}</h1>
          <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtGZHtWBSccrlC0rE4pDkfiWaYiKOZmrfQReOn_wdazM891q7Uoq8icWVqSj50HjbbmpOCosRKASmD3rcNU8cHCaBnVDT0ROUjKKtptFy7y981ViAcwTToNik2-3ElQqGyodD9_whxShOD-v6iC-TQ66rB5iYAY7UP5xgJh9H7-o45eCwxRVHPLdq4vt6iqLvEd8N_pdSoJJDJtlkC6rC9fZnPHbpylp6mH2WPjLYGCI6rhVADlXFRmdt33-k_hxp__PltYhmtUGk1"
            />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 pb-32">
        {/* iOS Large Title & Subtitle */}
        <section className="mt-4 mb-10">
          <h2 className="text-[40px] font-extrabold tracking-tight text-on-surface mb-3 leading-tight">{moduleInfo.title}</h2>
          <div className="flex items-center gap-3 text-on-surface-variant font-medium text-[15px]">
            <span>{moduleInfo.progress}% Complete</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/30"></span>
            <span>{moduleInfo.streak}</span>
          </div>
          {/* Global Progress Bar */}
          <div className="mt-8 w-full h-[6px] bg-surface-container rounded-full overflow-visible relative">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${moduleInfo.progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={clsx(`absolute top-0 left-0 h-full bg-gradient-to-r rounded-full`, moduleInfo.bgFrom, moduleInfo.bgTo)}
              style={{ boxShadow: `0 0 16px var(--color-${moduleInfo.color}-500, rgba(160,125,255,0.5))` }}
            ></motion.div>
          </div>
        </section>

        {/* Module Cards Grid/List */}
        {moduleInfo.isSyllabus ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-on-surface-variant uppercase tracking-widest">Syllabus Structure</h3>
              <button 
                onClick={() => openSyllabusAddModal('semester')}
                className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-xl font-bold text-sm hover:bg-primary/20 transition-all"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add Semester
              </button>
            </div>

            {moduleInfo.tasks.filter(t => t.type === 'semester').length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                <span className="material-symbols-outlined text-4xl text-white/20 mb-4">school</span>
                <p className="text-on-surface-variant">No semesters added yet. Start by adding a semester.</p>
              </div>
            )}

            {moduleInfo.tasks.filter(t => t.type === 'semester').map(sem => (
              <div key={sem.id} className="space-y-4">
                <div className="relative group">
                  <div 
                    onClick={() => toggleSemester(sem.id)}
                    className="w-full flex items-center justify-between p-6 glass-card rounded-3xl border border-white/10 text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 text-on-surface")}>
                        <span className="material-symbols-outlined text-[24px]">school</span>
                      </div>
                      <h3 className="text-xl font-bold text-on-surface">{sem.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMenu(e, sem.id);
                        }}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                      >
                        <span className="material-symbols-outlined text-on-surface-variant text-xl">more_vert</span>
                      </button>
                      <span className={clsx("material-symbols-outlined transition-transform", expandedSemesters[sem.id] ? "rotate-180" : "")}>expand_more</span>
                    </div>
                  </div>

                  {/* Options Menu for Semester */}
                  <AnimatePresence>
                    {activeMenu === sem.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="absolute top-16 right-12 bg-surface-container-high border border-white/10 rounded-xl shadow-xl overflow-hidden z-30"
                      >
                        <button 
                          onClick={() => openSyllabusAddModal('unit', sem.id)}
                          className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                        >
                          <span className="material-symbols-outlined text-[18px]">add</span>
                          Add Unit
                        </button>
                        <button 
                          onClick={(e) => openSyllabusEditModal(e, sem)}
                          className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                          Edit Semester
                        </button>
                        <button 
                          onClick={(e) => handleDeleteTask(e, sem.id)}
                          className="w-full px-4 py-3 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                          Delete Semester
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <AnimatePresence>
                  {expandedSemesters[sem.id] && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-4 space-y-4"
                    >
                      {moduleInfo.tasks.filter(t => t.type === 'unit' && t.parent_id === sem.id).map(unit => (
                        <div key={unit.id} className="space-y-3">
                          <div className="relative group">
                            <div 
                              onClick={() => toggleUnit(unit.id)}
                              className="w-full flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 text-left cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-violet-400 text-[20px]">folder</span>
                                <div>
                                  <h4 className="font-bold text-on-surface-variant">{unit.title}</h4>
                                  {unit.pdf_url && (
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setViewingPdfUrl(unit.pdf_url);
                                      }}
                                      className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 transition-colors mt-0.5"
                                    >
                                      <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                                      View PDF
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {unit.pdf_url && (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setViewingPdfUrl(unit.pdf_url);
                                    }}
                                    className="w-8 h-8 flex items-center justify-center rounded-full bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 transition-colors"
                                    title="View PDF"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                                  </button>
                                )}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(e, unit.id);
                                  }}
                                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-on-surface-variant text-lg">more_vert</span>
                                </button>
                                <span className={clsx("material-symbols-outlined text-sm transition-transform", expandedUnits[unit.id] ? "rotate-180" : "")}>expand_more</span>
                              </div>
                            </div>

                            {/* Options Menu for Unit */}
                            <AnimatePresence>
                              {activeMenu === unit.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                  className="absolute top-14 right-10 bg-surface-container-high border border-white/10 rounded-xl shadow-xl overflow-hidden z-30"
                                >
                                  <button 
                                    onClick={() => openSyllabusAddModal('topic', unit.id)}
                                    className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">add</span>
                                    Add Topic
                                  </button>
                                  <button 
                                    onClick={() => document.getElementById(`pdf-upload-${unit.id}`)?.click()}
                                    className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                                    disabled={isUploading === unit.id}
                                  >
                                    <span className={clsx("material-symbols-outlined text-[18px]", isUploading === unit.id && "animate-spin")}>
                                      {isUploading === unit.id ? 'sync' : 'picture_as_pdf'}
                                    </span>
                                    {isUploading === unit.id ? 'Uploading...' : 'Upload PDF'}
                                  </button>
                                  <input 
                                    id={`pdf-upload-${unit.id}`}
                                    type="file" 
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => handlePdfUpload(e, unit.id)}
                                  />
                                  {unit.pdf_url && (
                                      <button 
                                        onClick={(e) => handleDeletePdf(e, unit)}
                                        className="w-full px-4 py-3 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                                        disabled={isDeletingPdf === unit.id}
                                      >
                                        <span className={clsx("material-symbols-outlined text-[18px]", isDeletingPdf === unit.id && "animate-spin")}>
                                          {isDeletingPdf === unit.id ? 'sync' : 'delete_forever'}
                                        </span>
                                        {isDeletingPdf === unit.id ? 'Deleting...' : 'Delete PDF'}
                                      </button>
                                  )}
                                  <button 
                                    onClick={(e) => openSyllabusEditModal(e, unit)}
                                    className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                    Edit Unit
                                  </button>
                                  <button 
                                    onClick={(e) => handleDeleteTask(e, unit.id)}
                                    className="w-full px-4 py-3 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors"
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Delete Unit
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <AnimatePresence>
                            {expandedUnits[unit.id] && (
                              <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden pl-6 grid grid-cols-1 sm:grid-cols-2 gap-3"
                              >
                                {moduleInfo.tasks.filter(t => t.type === 'topic' && t.parent_id === unit.id).map(topic => (
                                  <div key={topic.id} className="relative group">
                                    <div
                                      onClick={() => openTopicDetail(topic)}
                                      className="w-full p-4 bg-white/5 rounded-xl border border-white/5 text-left hover:bg-white/10 transition-colors flex items-start gap-3 group cursor-pointer"
                                    >
                                      <span className={clsx("material-symbols-outlined text-[18px] mt-0.5", topic.answer ? "text-green-400" : "text-white/20")}>
                                        {topic.answer ? "check_circle" : "description"}
                                      </span>
                                      <div className="flex-1">
                                        <span className="text-sm font-medium text-on-surface block group-hover:text-primary transition-colors">{topic.title}</span>
                                        {topic.answer && (
                                          <span className="text-[10px] text-green-400/60 uppercase tracking-widest font-bold mt-1 block">Answer Added</span>
                                        )}
                                      </div>
                                    </div>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMenu(e, topic.id);
                                      }}
                                      className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                      <span className="material-symbols-outlined text-on-surface-variant text-sm">more_vert</span>
                                    </button>

                                    {/* Options Menu for Topic */}
                                    <AnimatePresence>
                                      {activeMenu === topic.id && (
                                        <motion.div
                                          initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                          animate={{ opacity: 1, scale: 1, y: 0 }}
                                          exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                          className="absolute top-10 right-2 bg-surface-container-high border border-white/10 rounded-xl shadow-xl overflow-hidden z-30 min-w-[140px]"
                                        >
                                          <button 
                                            onClick={(e) => openSyllabusEditModal(e, topic)}
                                            className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">edit</span>
                                            Edit Title
                                          </button>
                                          <button 
                                            onClick={(e) => handleDeleteTask(e, topic.id)}
                                            className="w-full px-4 py-3 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors"
                                          >
                                            <span className="material-symbols-outlined text-[16px]">delete</span>
                                            Delete Topic
                                          </button>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => openSyllabusAddModal('topic', unit.id)}
                                    className="flex-1 p-4 border border-dashed border-white/10 rounded-xl text-on-surface-variant text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                                  >
                                    <span className="material-symbols-outlined text-sm">add</span>
                                    Add Topic
                                  </button>
                                  
                                  {unit.pdf_url ? (
                                    <div className="flex gap-1">
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setViewingPdfUrl(unit.pdf_url);
                                        }}
                                        className="px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-violet-400 text-sm flex items-center justify-center gap-2 hover:bg-violet-500/20 transition-all"
                                      >
                                        <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                                        View PDF
                                      </button>
                                      <button 
                                        onClick={(e) => handleDeletePdf(e, unit)}
                                        className="w-10 h-10 bg-error/10 border border-error/20 rounded-xl text-error flex items-center justify-center hover:bg-error/20 transition-all"
                                        title="Delete PDF"
                                        disabled={isDeletingPdf === unit.id}
                                      >
                                        <span className={clsx("material-symbols-outlined text-sm", isDeletingPdf === unit.id && "animate-spin")}>
                                          {isDeletingPdf === unit.id ? 'sync' : 'delete_forever'}
                                        </span>
                                      </button>
                                    </div>
                                  ) : (
                                    <button 
                                      onClick={() => document.getElementById(`pdf-upload-btn-${unit.id}`)?.click()}
                                      className="px-4 py-2 border border-dashed border-white/10 rounded-xl text-on-surface-variant text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                                      disabled={isUploading === unit.id}
                                    >
                                      <span className={clsx("material-symbols-outlined text-sm", isUploading === unit.id && "animate-spin")}>
                                        {isUploading === unit.id ? 'sync' : 'upload_file'}
                                      </span>
                                      {isUploading === unit.id ? 'Uploading...' : 'Upload PDF'}
                                    </button>
                                  )}
                                  <input 
                                    id={`pdf-upload-btn-${unit.id}`}
                                    type="file" 
                                    accept="application/pdf"
                                    className="hidden"
                                    onChange={(e) => handlePdfUpload(e, unit.id)}
                                  />
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                      <button 
                        onClick={() => openSyllabusAddModal('unit', sem.id)}
                        className="ml-6 p-3 border border-dashed border-white/10 rounded-xl text-on-surface-variant text-xs flex items-center justify-center gap-2 hover:bg-white/5 transition-all"
                      >
                        <span className="material-symbols-outlined text-xs">add</span>
                        Add Unit
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {moduleInfo.tasks.map((task: any, index: number) => (
              <motion.div key={task.id} variants={item} className="glass-card rounded-[32px] p-8 relative flex flex-col justify-between min-h-[220px] group border border-white/5 overflow-hidden">
                <button 
                  onClick={(e) => toggleMenu(e, task.id)}
                  className="absolute top-6 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors z-20"
                >
                  <span className="material-symbols-outlined text-on-surface-variant text-xl">more_vert</span>
                </button>
                <div className={clsx(`absolute inset-0 bg-gradient-to-br opacity-5 -z-10`, moduleInfo.bgFrom, moduleInfo.bgTo)}></div>
                <div className="flex justify-between items-start">
                  <div className={clsx(`w-14 h-14 rounded-2xl flex items-center justify-center`, 
                    moduleInfo.color === 'violet' && "bg-violet-500/10 text-violet-400",
                    moduleInfo.color === 'blue' && "bg-blue-500/10 text-blue-400",
                    moduleInfo.color === 'green' && "bg-emerald-500/10 text-emerald-400",
                    moduleInfo.color === 'orange' && "bg-orange-500/10 text-orange-400"
                  )}>
                    <span className="material-symbols-outlined text-[28px]" style={{ fontVariationSettings: "'FILL' 1" }}>{task.icon}</span>
                  </div>
                  {/* Mini Progress Ring */}
                  <div className="relative w-12 h-12 flex items-center justify-center mr-4">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 48 48">
                      <circle className="text-surface-container-highest" cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeWidth="4"></circle>
                      <motion.circle 
                        initial={{ strokeDashoffset: 125.66 }}
                        animate={{ strokeDashoffset: 125.66 - (125.66 * (task.completed ? 1 : task.progress)) }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        cx="24" cy="24" fill="transparent" r="20" stroke="currentColor" strokeDasharray="125.66" strokeLinecap="round" strokeWidth="4"
                        className={clsx(
                          moduleInfo.color === 'violet' && "text-violet-400",
                          moduleInfo.color === 'blue' && "text-blue-400",
                          moduleInfo.color === 'green' && "text-emerald-400",
                          moduleInfo.color === 'orange' && "text-orange-400"
                        )}
                      ></motion.circle>
                    </svg>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-[20px] font-bold text-on-surface">{task.title}</h3>
                  <p className="text-on-surface-variant text-[14px] mt-1.5">{task.completed ? '100% complete' : `${Math.round(task.progress * 100)}% complete`}</p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <button 
                    onClick={() => toggleTask(task.id)}
                    className={clsx(
                      "px-6 py-2.5 rounded-full border text-[12px] font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                      task.completed 
                        ? clsx(
                            "text-background",
                            moduleInfo.color === 'violet' && "bg-violet-400 border-violet-400",
                            moduleInfo.color === 'blue' && "bg-blue-400 border-blue-400",
                            moduleInfo.color === 'green' && "bg-emerald-400 border-emerald-400",
                            moduleInfo.color === 'orange' && "bg-orange-400 border-orange-400"
                          )
                        : "border-white/10 text-on-surface-variant hover:bg-white/5"
                    )}
                  >
                    {task.completed ? (
                      <><span className="material-symbols-outlined text-[16px]">check</span> Done</>
                    ) : 'Mark Today Done'}
                  </button>
                </div>

                {/* Options Menu */}
                <AnimatePresence>
                  {activeMenu === task.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      className="absolute top-16 right-4 bg-surface-container-high border border-white/10 rounded-xl shadow-xl overflow-hidden z-30"
                    >
                      <button 
                        onClick={(e) => openEditModal(e, task)}
                        className="w-full px-4 py-3 text-left text-sm text-on-surface hover:bg-white/5 flex items-center gap-2 transition-colors border-b border-white/5"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                        Edit Task
                      </button>
                      <button 
                        onClick={(e) => handleDeleteTask(e, task.id)}
                        className="w-full px-4 py-3 text-left text-sm text-error hover:bg-white/5 flex items-center gap-2 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        Delete Task
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}

            {/* Empty State / Add New Card Visual */}
            <motion.div 
              variants={item} 
              onClick={() => {
                setNewTaskTitle('');
                setNewTaskIcon('check_circle');
                setIsAddingTask(true);
              }}
              className="rounded-[32px] p-8 border-2 border-dashed border-white/10 flex flex-col items-center justify-center min-h-[220px] opacity-40 hover:opacity-100 transition-opacity group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full border border-white/20 flex items-center justify-center transition-all group-hover:bg-white/10">
                <span className="material-symbols-outlined text-on-surface text-[28px]">add</span>
              </div>
              <span className="mt-5 text-[12px] font-bold tracking-widest uppercase text-on-surface">New Task</span>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* FAB: Contextual Action */}
      {!moduleInfo.isSyllabus && (
        <motion.button 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 20 }}
          onClick={() => {
            setNewTaskTitle('');
            setNewTaskIcon('check_circle');
            setIsAddingTask(true);
          }}
          className={clsx(
            "fixed bottom-28 right-8 z-50 px-6 py-4 rounded-full flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.5)] active:scale-95 transition-transform text-background font-bold",
            moduleInfo.color === 'violet' && "bg-violet-400",
            moduleInfo.color === 'blue' && "bg-blue-400",
            moduleInfo.color === 'green' && "bg-emerald-400",
            moduleInfo.color === 'orange' && "bg-orange-400"
          )}
        >
          <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_circle</span>
          <span className="tracking-tight text-[16px]">Add Task</span>
        </motion.button>
      )}

      {/* Topic Detail Modal (Syllabus) */}
      <AnimatePresence>
        {selectedTopicId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedTopicId(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="glass-card w-full max-w-2xl rounded-[40px] border border-white/10 p-8 relative z-10 bg-surface-container/90 shadow-2xl"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2 block">Topic Detail</span>
                  <h3 className="text-2xl font-bold text-on-surface leading-tight">
                    {moduleInfo.tasks.find(t => t.id === selectedTopicId)?.title}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedTopicId(null)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Answer / Notes</label>
                    <span className={clsx("text-[10px] font-bold", topicAnswer.length > 2800 ? "text-error" : "text-on-surface-variant")}>
                      {topicAnswer.length} / 3000
                    </span>
                  </div>
                  <textarea 
                    value={topicAnswer}
                    onChange={(e) => setTopicAnswer(e.target.value.slice(0, 3000))}
                    placeholder="Write your answer or notes here..."
                    className="w-full h-[350px] bg-white/5 border border-white/10 rounded-3xl px-6 py-5 text-on-surface placeholder:text-white/20 focus:outline-none focus:border-primary transition-all resize-none leading-relaxed text-[15px]"
                  />
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setSelectedTopicId(null)}
                    className="flex-1 px-6 py-4 rounded-2xl border border-white/10 font-bold text-on-surface hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSaveAnswer}
                    className="flex-[2] bg-primary text-on-primary font-bold rounded-2xl py-4 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
                  >
                    Save Answer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add/Edit Task Modal */}
      <AnimatePresence>
        {(isAddingTask || isEditingTask) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setIsAddingTask(false);
                setIsEditingTask(null);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-card w-full max-w-md rounded-[32px] border border-white/10 p-6 relative z-10 bg-surface-container/80"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {isEditingTask 
                    ? (moduleInfo.isSyllabus ? `Edit ${moduleInfo.tasks.find(t => t.id === isEditingTask)?.type || 'Item'}` : 'Edit Task')
                    : (addingSyllabusType ? `Add New ${addingSyllabusType}` : 'Add New Task')}
                </h3>
                <button 
                  onClick={() => {
                    setIsAddingTask(false);
                    setIsEditingTask(null);
                    setAddingSyllabusType(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>

              <form onSubmit={isEditingTask ? handleEditTask : handleAddTask} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-2">
                    {isEditingTask 
                      ? 'Title' 
                      : (addingSyllabusType ? `${addingSyllabusType.charAt(0).toUpperCase() + addingSyllabusType.slice(1)} Title` : 'Task Title')}
                  </label>
                  <input 
                    type="text" 
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder={addingSyllabusType ? `e.g., ${addingSyllabusType === 'semester' ? 'Semester I' : addingSyllabusType === 'unit' ? 'Unit 1' : 'Topic Name'}` : "e.g., Read Chapter 1"}
                    className="w-full bg-surface-container-highest border border-white/5 rounded-2xl px-4 py-3 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-colors"
                    required
                    autoFocus
                  />
                </div>

                {!addingSyllabusType && !isEditingTask && (
                  <div>
                    <label className="block text-sm font-medium text-on-surface-variant mb-2">Select Icon</label>
                    <div className="grid grid-cols-4 gap-3">
                      {taskIcons.map(icon => (
                        <button
                          key={icon}
                          type="button"
                          onClick={() => setNewTaskIcon(icon)}
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
                            newTaskIcon === icon 
                              ? 'bg-primary text-on-primary' 
                              : 'bg-white/5 text-on-surface hover:bg-white/10'
                          }`}
                        >
                          <span className="material-symbols-outlined">{icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="w-full bg-primary text-on-primary font-bold rounded-2xl py-4 mt-2 hover:opacity-90 transition-all disabled:opacity-50"
                >
                  {isEditingTask 
                    ? 'Save Changes' 
                    : (addingSyllabusType ? `Add ${addingSyllabusType.charAt(0).toUpperCase() + addingSyllabusType.slice(1)}` : 'Create Task')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {viewingPdfUrl && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingPdfUrl(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl h-[85vh] bg-surface-container-high rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface-container-highest">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-violet-400">picture_as_pdf</span>
                  <span className="font-bold text-on-surface truncate max-w-[200px] sm:max-w-md">PDF Viewer</span>
                </div>
                <div className="flex items-center gap-2">
                  <a 
                    href={viewingPdfUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                    title="Open in New Tab"
                  >
                    <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                  </a>
                  <button 
                    onClick={() => setViewingPdfUrl(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-[#525659]">
                <iframe 
                  src={`${viewingPdfUrl}#toolbar=0`}
                  className="w-full h-full border-none"
                  title="PDF Viewer"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
