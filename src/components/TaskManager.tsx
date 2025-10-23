import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Tag, 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Edit3, 
  Trash2, 
  Folder,
  Target,
  TrendingUp,
  Calendar
} from 'lucide-react';

interface Task {
  id: string;
  name: string;
  project: string;
  description?: string;
  estimatedTime?: number; // in minutes
  actualTime: number; // in minutes
  completed: boolean;
  createdAt: number;
  completedAt?: number;
  tags: string[];
  priority: 'low' | 'medium' | 'high';
}

interface Project {
  id: string;
  name: string;
  color: string;
  totalTime: number; // in minutes
  taskCount: number;
  completedTasks: number;
  createdAt: number;
}

interface TaskManagerProps {
  onTaskStart: (task: Task) => void;
  onTaskEnd: (task: Task, timeSpent: number) => void;
  currentTaskId?: string;
  isSessionActive: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = memo(({ 
  onTaskStart, 
  onTaskEnd, 
  currentTaskId, 
  isSessionActive 
}) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      name: 'Implement user authentication',
      project: 'Web App',
      description: 'Add login/signup functionality',
      estimatedTime: 120,
      actualTime: 0,
      completed: false,
      createdAt: Date.now() - 86400000,
      tags: ['frontend', 'auth'],
      priority: 'high'
    },
    {
      id: '2',
      name: 'Design dashboard UI',
      project: 'Web App',
      description: 'Create responsive dashboard layout',
      estimatedTime: 90,
      actualTime: 45,
      completed: false,
      createdAt: Date.now() - 172800000,
      tags: ['design', 'ui'],
      priority: 'medium'
    },
    {
      id: '3',
      name: 'Write API documentation',
      project: 'Backend',
      description: 'Document all REST endpoints',
      estimatedTime: 60,
      actualTime: 30,
      completed: true,
      createdAt: Date.now() - 259200000,
      completedAt: Date.now() - 86400000,
      tags: ['documentation', 'api'],
      priority: 'low'
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Web App',
      color: '#3B82F6',
      totalTime: 180,
      taskCount: 2,
      completedTasks: 0,
      createdAt: Date.now() - 259200000
    },
    {
      id: '2',
      name: 'Backend',
      color: '#10B981',
      totalTime: 90,
      taskCount: 1,
      completedTasks: 1,
      createdAt: Date.now() - 259200000
    },
    {
      id: '3',
      name: 'Mobile App',
      color: '#F59E0B',
      totalTime: 0,
      taskCount: 0,
      completedTasks: 0,
      createdAt: Date.now() - 172800000
    }
  ]);

  const [showAddTask, setShowAddTask] = useState(false);
  const [showAddProject, setShowAddProject] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [newTask, setNewTask] = useState<Partial<Task>>({
    name: '',
    project: '',
    description: '',
    estimatedTime: 60,
    tags: [],
    priority: 'medium'
  });

  const [newProject, setNewProject] = useState<Partial<Project>>({
    name: '',
    color: '#3B82F6'
  });

  // Update project stats when tasks change
  useEffect(() => {
    const updatedProjects = projects.map(project => {
      const projectTasks = tasks.filter(task => task.project === project.name);
      const totalTime = projectTasks.reduce((sum, task) => sum + task.actualTime, 0);
      const completedTasks = projectTasks.filter(task => task.completed).length;
      
      return {
        ...project,
        totalTime,
        taskCount: projectTasks.length,
        completedTasks
      };
    });
    
    setProjects(updatedProjects);
  }, [tasks]);

  const formatTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const addTask = useCallback(() => {
    if (!newTask.name || !newTask.project) return;

    const task: Task = {
      id: Date.now().toString(),
      name: newTask.name,
      project: newTask.project,
      description: newTask.description || '',
      estimatedTime: newTask.estimatedTime || 60,
      actualTime: 0,
      completed: false,
      createdAt: Date.now(),
      tags: newTask.tags || [],
      priority: newTask.priority || 'medium'
    };

    setTasks(prev => [...prev, task]);
    setNewTask({
      name: '',
      project: '',
      description: '',
      estimatedTime: 60,
      tags: [],
      priority: 'medium'
    });
    setShowAddTask(false);
  }, [newTask]);

  const addProject = useCallback(() => {
    if (!newProject.name) return;

    const project: Project = {
      id: Date.now().toString(),
      name: newProject.name,
      color: newProject.color || '#3B82F6',
      totalTime: 0,
      taskCount: 0,
      completedTasks: 0,
      createdAt: Date.now()
    };

    setProjects(prev => [...prev, project]);
    setNewProject({ name: '', color: '#3B82F6' });
    setShowAddProject(false);
  }, [newProject]);

  const startTask = useCallback((task: Task) => {
    onTaskStart(task);
  }, [onTaskStart]);

  const endTask = useCallback((task: Task) => {
    onTaskEnd(task, task.actualTime);
  }, [onTaskEnd]);

  const toggleTaskCompletion = useCallback((taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            completed: !task.completed,
            completedAt: !task.completed ? Date.now() : undefined
          }
        : task
    ));
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  const filteredTasks = tasks.filter(task => 
    selectedProject === 'all' || task.project === selectedProject
  );

  const activeTask = tasks.find(task => task.id === currentTaskId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Target className="w-6 h-6" />
            Task Manager
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAddProject(true)}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <Folder className="w-4 h-4" />
              Add Project
            </button>
            <button
              onClick={() => setShowAddTask(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Task
            </button>
          </div>
        </div>

        {/* Project Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto">
          <button
            onClick={() => setSelectedProject('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedProject === 'all' 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Projects
          </button>
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project.name)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedProject === project.name 
                  ? 'text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: selectedProject === project.name ? project.color : undefined
              }}
            >
              {project.name}
            </button>
          ))}
        </div>

        {/* Active Task */}
        {activeTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">Currently Working On:</h4>
                <p className="text-blue-700">{activeTask.name}</p>
                <p className="text-sm text-blue-600">{activeTask.project}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {formatTime(activeTask.actualTime)}
                </div>
                <div className="text-sm text-blue-600">Time Spent</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Projects Overview */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <Folder className="w-5 h-5" />
          Projects Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {projects.map(project => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <h4 className="font-semibold text-black">{project.name}</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Time</span>
                  <span className="font-semibold text-black">{formatTime(project.totalTime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tasks</span>
                  <span className="font-semibold text-black">
                    {project.completedTasks}/{project.taskCount}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: `${project.taskCount > 0 ? (project.completedTasks / project.taskCount) * 100 : 0}%`,
                      backgroundColor: project.color
                    }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Tasks
        </h3>
        <div className="space-y-3">
          {filteredTasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border-2 transition-all ${
                task.completed 
                  ? 'bg-green-50 border-green-200' 
                  : currentTaskId === task.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-semibold ${task.completed ? 'line-through text-gray-600' : 'text-black'}`}>
                      {task.name}
                    </h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    {task.completed && (
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{task.project}</p>
                  {task.description && (
                    <p className="text-sm text-gray-500 mb-2">{task.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-600">
                        {formatTime(task.actualTime)} / {formatTime(task.estimatedTime || 0)}
                      </span>
                    </div>
                    {task.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <div className="flex gap-1">
                          {task.tags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {!task.completed && (
                    <button
                      onClick={() => startTask(task)}
                      disabled={isSessionActive && currentTaskId !== task.id}
                      className={`p-2 rounded-lg transition-colors ${
                        currentTaskId === task.id
                          ? 'bg-green-500 text-white'
                          : 'bg-blue-500 text-white hover:bg-blue-600'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {currentTaskId === task.id ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                  )}
                  
                  <button
                    onClick={() => toggleTaskCompletion(task.id)}
                    className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setEditingTask(task)}
                    className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddTask(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-black mb-4">Add New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Name
                  </label>
                  <input
                    type="text"
                    value={newTask.name || ''}
                    onChange={(e) => setNewTask(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project
                  </label>
                  <select
                    value={newTask.project || ''}
                    onChange={(e) => setNewTask(prev => ({ ...prev, project: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select project</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.name}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Enter task description"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Time (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newTask.estimatedTime || 60}
                      onChange={(e) => setNewTask(prev => ({ ...prev, estimatedTime: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Priority
                    </label>
                    <select
                      value={newTask.priority || 'medium'}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Add Task
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Project Modal */}
      <AnimatePresence>
        {showAddProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddProject(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-black mb-4">Add New Project</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Name
                  </label>
                  <input
                    type="text"
                    value={newProject.name || ''}
                    onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter project name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'].map(color => (
                      <button
                        key={color}
                        onClick={() => setNewProject(prev => ({ ...prev, color }))}
                        className={`w-8 h-8 rounded-full border-2 ${
                          newProject.color === color ? 'border-black' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddProject(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addProject}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                >
                  Add Project
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

TaskManager.displayName = 'TaskManager';

export default TaskManager;
