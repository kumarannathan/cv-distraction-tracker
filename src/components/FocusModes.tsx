import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Lightbulb, 
  BookOpen, 
  Zap, 
  Settings, 
  Play, 
  Pause, 
  Square,
  Clock,
  Target,
  Shield,
  Coffee,
  Moon,
  Sun,
  Activity
} from 'lucide-react';

interface FocusMode {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  settings: {
    sessionDuration: number; // in minutes
    breakDuration: number; // in minutes
    longBreakDuration: number; // in minutes
    longBreakInterval: number; // every N sessions
    strictMode: boolean;
    distractionBlocking: boolean;
    ambientSounds: string[];
    breakReminders: boolean;
    eyeRuleInterval: number; // in minutes
    stretchInterval: number; // in minutes
    walkInterval: number; // in minutes
    hydrationInterval: number; // in minutes
    backgroundTheme: 'light' | 'dark' | 'auto';
    intensity: 'low' | 'medium' | 'high';
  };
  isActive: boolean;
  totalSessions: number;
  totalTime: number; // in minutes
  averageScore: number;
  createdAt: number;
}

interface FocusModesProps {
  onModeActivated: (mode: FocusMode) => void;
  onModeDeactivated: () => void;
  currentModeId?: string;
  isSessionActive: boolean;
}

const FocusModes: React.FC<FocusModesProps> = memo(({ 
  onModeActivated, 
  onModeDeactivated, 
  currentModeId, 
  isSessionActive 
}) => {
  const [modes, setModes] = useState<FocusMode[]>([
    {
      id: 'deep-work',
      name: 'Deep Work',
      description: 'Intense focus sessions with minimal distractions',
      icon: Brain,
      color: '#3B82F6',
      settings: {
        sessionDuration: 90,
        breakDuration: 15,
        longBreakDuration: 30,
        longBreakInterval: 2,
        strictMode: true,
        distractionBlocking: true,
        ambientSounds: ['white-noise', 'rain'],
        breakReminders: true,
        eyeRuleInterval: 20,
        stretchInterval: 45,
        walkInterval: 90,
        hydrationInterval: 30,
        backgroundTheme: 'dark',
        intensity: 'high'
      },
      isActive: false,
      totalSessions: 23,
      totalTime: 1840, // 30h 40m
      averageScore: 92,
      createdAt: Date.now() - 2592000000
    },
    {
      id: 'creative',
      name: 'Creative Flow',
      description: 'Flexible sessions for creative work and brainstorming',
      icon: Lightbulb,
      color: '#F59E0B',
      settings: {
        sessionDuration: 60,
        breakDuration: 10,
        longBreakDuration: 20,
        longBreakInterval: 3,
        strictMode: false,
        distractionBlocking: false,
        ambientSounds: ['coffee-shop', 'forest'],
        breakReminders: true,
        eyeRuleInterval: 25,
        stretchInterval: 30,
        walkInterval: 60,
        hydrationInterval: 25,
        backgroundTheme: 'light',
        intensity: 'medium'
      },
      isActive: false,
      totalSessions: 18,
      totalTime: 1080, // 18h 0m
      averageScore: 87,
      createdAt: Date.now() - 1728000000
    },
    {
      id: 'study',
      name: 'Study Mode',
      description: 'Pomodoro-based sessions optimized for learning',
      icon: BookOpen,
      color: '#10B981',
      settings: {
        sessionDuration: 25,
        breakDuration: 5,
        longBreakDuration: 15,
        longBreakInterval: 4,
        strictMode: true,
        distractionBlocking: true,
        ambientSounds: ['white-noise', 'binaural'],
        breakReminders: true,
        eyeRuleInterval: 20,
        stretchInterval: 25,
        walkInterval: 50,
        hydrationInterval: 20,
        backgroundTheme: 'light',
        intensity: 'high'
      },
      isActive: false,
      totalSessions: 45,
      totalTime: 1125, // 18h 45m
      averageScore: 89,
      createdAt: Date.now() - 3456000000
    },
    {
      id: 'light-work',
      name: 'Light Work',
      description: 'Relaxed focus for routine tasks and emails',
      icon: Zap,
      color: '#8B5CF6',
      settings: {
        sessionDuration: 30,
        breakDuration: 5,
        longBreakDuration: 10,
        longBreakInterval: 6,
        strictMode: false,
        distractionBlocking: false,
        ambientSounds: ['ocean', 'fireplace'],
        breakReminders: false,
        eyeRuleInterval: 30,
        stretchInterval: 60,
        walkInterval: 120,
        hydrationInterval: 45,
        backgroundTheme: 'auto',
        intensity: 'low'
      },
      isActive: false,
      totalSessions: 32,
      totalTime: 960, // 16h 0m
      averageScore: 78,
      createdAt: Date.now() - 1296000000
    }
  ]);

  const [showSettings, setShowSettings] = useState(false);
  const [editingMode, setEditingMode] = useState<FocusMode | null>(null);
  const [showCreateMode, setShowCreateMode] = useState(false);
  const [newMode, setNewMode] = useState<Partial<FocusMode>>({
    name: '',
    description: '',
    color: '#3B82F6',
    settings: {
      sessionDuration: 60,
      breakDuration: 10,
      longBreakDuration: 20,
      longBreakInterval: 3,
      strictMode: false,
      distractionBlocking: false,
      ambientSounds: [],
      breakReminders: true,
      eyeRuleInterval: 25,
      stretchInterval: 45,
      walkInterval: 60,
      hydrationInterval: 30,
      backgroundTheme: 'auto',
      intensity: 'medium'
    }
  });

  const activateMode = useCallback((mode: FocusMode) => {
    // Deactivate current mode
    setModes(prev => prev.map(m => ({ ...m, isActive: false })));
    
    // Activate new mode
    setModes(prev => prev.map(m => 
      m.id === mode.id ? { ...m, isActive: true } : m
    ));
    
    onModeActivated(mode);
  }, [onModeActivated]);

  const deactivateMode = useCallback(() => {
    setModes(prev => prev.map(m => ({ ...m, isActive: false })));
    onModeDeactivated();
  }, [onModeDeactivated]);

  const formatTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  const getIntensityColor = useCallback((intensity: string) => {
    switch (intensity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getThemeIcon = useCallback((theme: string) => {
    switch (theme) {
      case 'light': return <Sun className="w-4 h-4" />;
      case 'dark': return <Moon className="w-4 h-4" />;
      case 'auto': return <Activity className="w-4 h-4" />;
      default: return <Sun className="w-4 h-4" />;
    }
  }, []);

  const createCustomMode = useCallback(() => {
    if (!newMode.name || !newMode.description) return;

    const mode: FocusMode = {
      id: Date.now().toString(),
      name: newMode.name,
      description: newMode.description,
      icon: Brain,
      color: newMode.color || '#3B82F6',
      settings: newMode.settings!,
      isActive: false,
      totalSessions: 0,
      totalTime: 0,
      averageScore: 0,
      createdAt: Date.now()
    };

    setModes(prev => [...prev, mode]);
    setNewMode({
      name: '',
      description: '',
      color: '#3B82F6',
      settings: {
        sessionDuration: 60,
        breakDuration: 10,
        longBreakDuration: 20,
        longBreakInterval: 3,
        strictMode: false,
        distractionBlocking: false,
        ambientSounds: [],
        breakReminders: true,
        eyeRuleInterval: 25,
        stretchInterval: 45,
        walkInterval: 60,
        hydrationInterval: 30,
        backgroundTheme: 'auto',
        intensity: 'medium'
      }
    });
    setShowCreateMode(false);
  }, [newMode]);

  const currentMode = modes.find(mode => mode.id === currentModeId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Brain className="w-6 h-6" />
            Focus Modes
          </h3>
          <button
            onClick={() => setShowCreateMode(true)}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-semibold"
          >
            Create Custom
          </button>
        </div>

        {/* Current Mode */}
        {currentMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl border-2"
            style={{ 
              backgroundColor: currentMode.color + '10',
              borderColor: currentMode.color + '40'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: currentMode.color + '20' }}
                >
                  <currentMode.icon 
                    className="w-6 h-6" 
                    style={{ color: currentMode.color }}
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-black">{currentMode.name}</h4>
                  <p className="text-sm text-gray-600">{currentMode.description}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-black">
                  {currentMode.settings.sessionDuration}m
                </div>
                <div className="text-sm text-gray-600">Session Length</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {modes.map((mode, index) => {
          const Icon = mode.icon;
          const isCurrentMode = mode.id === currentModeId;
          
          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${
                isCurrentMode
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => !isSessionActive && activateMode(mode)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: mode.color + '20' }}
                  >
                    <Icon 
                      className="w-6 h-6" 
                      style={{ color: mode.color }}
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-black">{mode.name}</h4>
                    <p className="text-sm text-gray-600">{mode.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getIntensityColor(mode.settings.intensity)}`}>
                    {mode.settings.intensity}
                  </span>
                  {isCurrentMode && (
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
              </div>

              {/* Mode Stats */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-black">{mode.totalSessions}</div>
                  <div className="text-xs text-gray-600">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">{formatTime(mode.totalTime)}</div>
                  <div className="text-xs text-gray-600">Total Time</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-black">{mode.averageScore}%</div>
                  <div className="text-xs text-gray-600">Avg Score</div>
                </div>
              </div>

              {/* Mode Settings Preview */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Session Duration</span>
                  <span className="font-semibold text-black">{mode.settings.sessionDuration}m</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Break Duration</span>
                  <span className="font-semibold text-black">{mode.settings.breakDuration}m</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Strict Mode</span>
                  <span className="font-semibold text-black">
                    {mode.settings.strictMode ? 'On' : 'Off'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Theme</span>
                  <div className="flex items-center gap-1">
                    {getThemeIcon(mode.settings.backgroundTheme)}
                    <span className="font-semibold text-black capitalize">
                      {mode.settings.backgroundTheme}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => isCurrentMode ? deactivateMode() : activateMode(mode)}
                disabled={isSessionActive && !isCurrentMode}
                className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
                  isCurrentMode
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-800 text-white hover:bg-gray-900'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isCurrentMode ? 'Deactivate' : 'Activate Mode'}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Create Custom Mode Modal */}
      <AnimatePresence>
        {showCreateMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateMode(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-black shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-black mb-4">Create Custom Focus Mode</h3>
              
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mode Name
                    </label>
                    <input
                      type="text"
                      value={newMode.name || ''}
                      onChange={(e) => setNewMode(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., My Custom Mode"
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
                          onClick={() => setNewMode(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-full border-2 ${
                            newMode.color === color ? 'border-black' : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newMode.description || ''}
                    onChange={(e) => setNewMode(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Describe what this mode is for..."
                  />
                </div>

                {/* Timer Settings */}
                <div>
                  <h4 className="font-semibold text-black mb-3">Timer Settings</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Session (min)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="180"
                        value={newMode.settings?.sessionDuration || 60}
                        onChange={(e) => setNewMode(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, sessionDuration: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Break (min)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="60"
                        value={newMode.settings?.breakDuration || 10}
                        onChange={(e) => setNewMode(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, breakDuration: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Long Break (min)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={newMode.settings?.longBreakDuration || 20}
                        onChange={(e) => setNewMode(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, longBreakDuration: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Long Break Interval
                      </label>
                      <input
                        type="number"
                        min="2"
                        max="10"
                        value={newMode.settings?.longBreakInterval || 3}
                        onChange={(e) => setNewMode(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, longBreakInterval: parseInt(e.target.value) }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Mode Settings */}
                <div>
                  <h4 className="font-semibold text-black mb-3">Mode Settings</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-black font-medium">Strict Mode</h5>
                        <p className="text-sm text-gray-600">Block distractions and enforce breaks</p>
                      </div>
                      <button
                        onClick={() => setNewMode(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, strictMode: !prev.settings!.strictMode }
                        }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          newMode.settings?.strictMode ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          newMode.settings?.strictMode ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-black font-medium">Distraction Blocking</h5>
                        <p className="text-sm text-gray-600">Block notifications and websites</p>
                      </div>
                      <button
                        onClick={() => setNewMode(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, distractionBlocking: !prev.settings!.distractionBlocking }
                        }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          newMode.settings?.distractionBlocking ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          newMode.settings?.distractionBlocking ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="text-black font-medium">Break Reminders</h5>
                        <p className="text-sm text-gray-600">Enable break and eye care reminders</p>
                      </div>
                      <button
                        onClick={() => setNewMode(prev => ({ 
                          ...prev, 
                          settings: { ...prev.settings!, breakReminders: !prev.settings!.breakReminders }
                        }))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          newMode.settings?.breakReminders ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          newMode.settings?.breakReminders ? 'translate-x-7' : 'translate-x-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Intensity and Theme */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Intensity Level
                    </label>
                    <select
                      value={newMode.settings?.intensity || 'medium'}
                      onChange={(e) => setNewMode(prev => ({ 
                        ...prev, 
                        settings: { ...prev.settings!, intensity: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Background Theme
                    </label>
                    <select
                      value={newMode.settings?.backgroundTheme || 'auto'}
                      onChange={(e) => setNewMode(prev => ({ 
                        ...prev, 
                        settings: { ...prev.settings!, backgroundTheme: e.target.value as any }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateMode(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createCustomMode}
                  className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-semibold"
                >
                  Create Mode
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FocusModes.displayName = 'FocusModes';

export default FocusModes;
