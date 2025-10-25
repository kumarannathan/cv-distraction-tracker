import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Eye, 
  Activity, 
  Coffee, 
  Move, 
  AlertCircle,
  CheckCircle,
  Settings,
  Bell,
  Timer,
  Heart
} from 'lucide-react';

interface BreakReminder {
  id: string;
  type: 'eye' | 'stretch' | 'walk' | 'hydration' | 'posture';
  name: string;
  description: string;
  interval: number; // in minutes
  lastTriggered: number;
  isEnabled: boolean;
  icon: React.ComponentType<any>;
  color: string;
  duration: number; // in minutes
}

interface BreakSettings {
  eyeRuleEnabled: boolean;
  eyeRuleInterval: number; // 20-20-20 rule
  stretchReminders: boolean;
  stretchInterval: number;
  walkReminders: boolean;
  walkInterval: number;
  hydrationReminders: boolean;
  hydrationInterval: number;
  postureReminders: boolean;
  postureInterval: number;
  soundEnabled: boolean;
  desktopNotifications: boolean;
}

interface BreakRemindersProps {
  sessionStartTime: number;
  isSessionActive: boolean;
  onBreakStart: () => void;
  onBreakEnd: () => void;
}

const BreakReminders: React.FC<BreakRemindersProps> = memo(({ 
  sessionStartTime, 
  isSessionActive, 
  onBreakStart, 
  onBreakEnd 
}) => {
  const [reminders, setReminders] = useState<BreakReminder[]>([
    {
      id: 'eye',
      type: 'eye',
      name: '20-20-20 Rule',
      description: 'Look at something 20 feet away for 20 seconds',
      interval: 20,
      lastTriggered: 0,
      isEnabled: true,
      icon: Eye,
      color: '#3B82F6',
      duration: 1
    },
    {
      id: 'stretch',
      type: 'stretch',
      name: 'Stretch Break',
      description: 'Take a moment to stretch your body',
      interval: 45,
      lastTriggered: 0,
      isEnabled: true,
      icon: Move,
      color: '#10B981',
      duration: 2
    },
    {
      id: 'walk',
      type: 'walk',
      name: 'Walk Break',
      description: 'Take a short walk to get your blood flowing',
      interval: 60,
      lastTriggered: 0,
      isEnabled: true,
      icon: Activity,
      color: '#F59E0B',
      duration: 5
    },
    {
      id: 'hydration',
      type: 'hydration',
      name: 'Hydration Check',
      description: 'Time to drink some water',
      interval: 30,
      lastTriggered: 0,
      isEnabled: true,
      icon: Coffee,
      color: '#06B6D4',
      duration: 1
    },
    {
      id: 'posture',
      type: 'posture',
      name: 'Posture Check',
      description: 'Check and adjust your sitting posture',
      interval: 25,
      lastTriggered: 0,
      isEnabled: true,
      icon: Heart,
      color: '#EF4444',
      duration: 1
    }
  ]);

  const [settings, setSettings] = useState<BreakSettings>({
    eyeRuleEnabled: true,
    eyeRuleInterval: 20,
    stretchReminders: true,
    stretchInterval: 45,
    walkReminders: true,
    walkInterval: 60,
    hydrationReminders: true,
    hydrationInterval: 30,
    postureReminders: true,
    postureInterval: 25,
    soundEnabled: true,
    desktopNotifications: true
  });

  const [activeBreak, setActiveBreak] = useState<BreakReminder | null>(null);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'info' | 'warning' | 'success';
    message: string;
    timestamp: number;
  }>>([]);

  // Check for break reminders
  useEffect(() => {
    if (!isSessionActive || !sessionStartTime) return;

    const checkReminders = () => {
      const now = Date.now();
      // const sessionDuration = (now - sessionStartTime) / 1000 / 60; // in minutes

      reminders.forEach(reminder => {
        if (!reminder.isEnabled) return;

        const timeSinceLastTrigger = (now - reminder.lastTriggered) / 1000 / 60;
        const shouldTrigger = timeSinceLastTrigger >= reminder.interval;

        if (shouldTrigger && !activeBreak) {
          triggerBreakReminder(reminder);
        }
      });
    };

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime, reminders, activeBreak]);

  // Break timer
  useEffect(() => {
    if (!activeBreak || breakTimeRemaining <= 0) return;

    const timer = setInterval(() => {
      setBreakTimeRemaining(prev => {
        if (prev <= 1) {
          endBreak();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeBreak, breakTimeRemaining]);

  const triggerBreakReminder = useCallback((reminder: BreakReminder) => {
    setActiveBreak(reminder);
    setBreakTimeRemaining(reminder.duration * 60); // Convert to seconds
    onBreakStart();

    // Update last triggered time
    setReminders(prev => prev.map(r => 
      r.id === reminder.id 
        ? { ...r, lastTriggered: Date.now() }
        : r
    ));

    // Show notification
    if (settings.desktopNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(`Break Reminder: ${reminder.name}`, {
          body: reminder.description,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(`Break Reminder: ${reminder.name}`, {
              body: reminder.description,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }

    // Add to notifications list
    setNotifications(prev => [{
      id: Date.now().toString(),
      type: 'info',
      message: `${reminder.name}: ${reminder.description}`,
      timestamp: Date.now()
    }, ...prev.slice(0, 9)]); // Keep only last 10 notifications
  }, [onBreakStart, settings.desktopNotifications]);

  const endBreak = useCallback(() => {
    setActiveBreak(null);
    setBreakTimeRemaining(0);
    onBreakEnd();

    // Add completion notification
    if (activeBreak) {
      setNotifications(prev => [{
        id: Date.now().toString(),
        type: 'success',
        message: `Completed: ${activeBreak.name}`,
        timestamp: Date.now()
      }, ...prev.slice(0, 9)]);
    }
  }, [activeBreak, onBreakEnd]);

  const skipBreak = useCallback(() => {
    setActiveBreak(null);
    setBreakTimeRemaining(0);
    onBreakEnd();
  }, [onBreakEnd]);

  const toggleReminder = useCallback((reminderId: string) => {
    setReminders(prev => prev.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, isEnabled: !reminder.isEnabled }
        : reminder
    ));
  }, []);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getNextReminder = useCallback(() => {
    const now = Date.now();
    let nextReminder: { reminder: BreakReminder; timeUntil: number } | null = null;

    reminders.forEach(reminder => {
      if (!reminder.isEnabled) return;

      const timeSinceLastTrigger = (now - reminder.lastTriggered) / 1000 / 60;
      const timeUntilNext = reminder.interval - timeSinceLastTrigger;

      if (timeUntilNext > 0 && (!nextReminder || timeUntilNext < nextReminder.timeUntil)) {
        nextReminder = { reminder, timeUntil: timeUntilNext };
      }
    });

    return nextReminder;
  }, [reminders]);

  const nextReminder = getNextReminder();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Break Reminders
          </h3>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Next Reminder */}
        {nextReminder && !activeBreak && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-blue-900">Next Reminder:</h4>
                <p className="text-blue-700">{(nextReminder as any)?.reminder?.name || 'No reminder'}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-900">
                  {Math.round((nextReminder as any)?.timeUntil || 0)}m
                </div>
                <div className="text-sm text-blue-600">Time Until</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Break */}
        <AnimatePresence>
          {activeBreak && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-6 p-6 bg-green-50 border border-green-200 rounded-xl"
            >
              <div className="text-center">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: activeBreak.color + '20' }}
                >
                  <activeBreak.icon 
                    className="w-8 h-8" 
                    style={{ color: activeBreak.color }}
                  />
                </div>
                <h4 className="text-xl font-bold text-green-900 mb-2">
                  {activeBreak.name}
                </h4>
                <p className="text-green-700 mb-4">{activeBreak.description}</p>
                
                <div className="text-4xl font-bold text-green-900 mb-4">
                  {formatTime(breakTimeRemaining)}
                </div>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={endBreak}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
                  >
                    Complete Break
                  </button>
                  <button
                    onClick={skipBreak}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
                  >
                    Skip
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg"
          >
            <h3 className="text-lg font-bold text-black mb-4">Break Settings</h3>
            
            <div className="space-y-6">
              {/* Eye Rule Settings */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-black font-semibold">20-20-20 Rule</h4>
                  <p className="text-sm text-gray-600">Look at something 20 feet away for 20 seconds</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={settings.eyeRuleInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, eyeRuleInterval: parseInt(e.target.value) }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, eyeRuleEnabled: !prev.eyeRuleEnabled }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.eyeRuleEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.eyeRuleEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Stretch Settings */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-black font-semibold">Stretch Reminders</h4>
                  <p className="text-sm text-gray-600">Remind to stretch and move</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="10"
                    max="120"
                    value={settings.stretchInterval}
                    onChange={(e) => setSettings(prev => ({ ...prev, stretchInterval: parseInt(e.target.value) }))}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <span className="text-sm text-gray-600">minutes</span>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, stretchReminders: !prev.stretchReminders }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      settings.stretchReminders ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      settings.stretchReminders ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-black font-semibold">Desktop Notifications</h4>
                  <p className="text-sm text-gray-600">Show system notifications for breaks</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, desktopNotifications: !prev.desktopNotifications }))}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    settings.desktopNotifications ? 'bg-green-500' : 'bg-gray-300'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                    settings.desktopNotifications ? 'translate-x-7' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminders List */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <Timer className="w-5 h-5" />
          Break Reminders
        </h3>
        <div className="space-y-3">
          {reminders.map((reminder, index) => {
            const Icon = reminder.icon;
            const timeSinceLastTrigger = (Date.now() - reminder.lastTriggered) / 1000 / 60;
            
            return (
              <motion.div
                key={reminder.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  reminder.isEnabled 
                    ? 'bg-gray-50 border-gray-200' 
                    : 'bg-gray-100 border-gray-300 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: reminder.color + '20' }}
                    >
                      <Icon 
                        className="w-5 h-5" 
                        style={{ color: reminder.color }}
                      />
                    </div>
                    <div>
                      <h4 className="font-semibold text-black">{reminder.name}</h4>
                      <p className="text-sm text-gray-600">{reminder.description}</p>
                      <p className="text-xs text-gray-500">
                        Every {reminder.interval} minutes • {reminder.duration} min break
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-sm font-semibold text-black">
                        {Math.round(timeSinceLastTrigger)}m ago
                      </div>
                      <div className="text-xs text-gray-500">Last triggered</div>
                    </div>
                    
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        reminder.isEnabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        reminder.isEnabled ? 'translate-x-7' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent Notifications */}
      {notifications.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Recent Notifications
          </h3>
          <div className="space-y-2">
            {notifications.slice(0, 5).map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-lg border ${
                  notification.type === 'success' ? 'bg-green-50 border-green-200' :
                  notification.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                  'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  {notification.type === 'success' ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                  )}
                  <span className="text-sm text-black">{notification.message}</span>
                  <span className="text-xs text-gray-500 ml-auto">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

BreakReminders.displayName = 'BreakReminders';

export default BreakReminders;
