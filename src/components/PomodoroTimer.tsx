import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, RotateCcw, Settings, Clock } from 'lucide-react';

interface PomodoroSettings {
  workDuration: number; // in minutes
  breakDuration: number; // in minutes
  longBreakDuration: number; // in minutes
  longBreakInterval: number; // every N pomodoros
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
}

interface PomodoroState {
  isActive: boolean;
  isPaused: boolean;
  currentPhase: 'work' | 'shortBreak' | 'longBreak';
  timeRemaining: number; // in seconds
  completedPomodoros: number;
  currentPomodoro: number;
}

const PomodoroTimer: React.FC<{
  onSessionStart: () => void;
  onSessionEnd: () => void;
  onBreakStart: () => void;
  onBreakEnd: () => void;
}> = memo(({ onSessionStart, onSessionEnd, onBreakStart, onBreakEnd }) => {
  const [settings, setSettings] = useState<PomodoroSettings>({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartPomodoros: true,
    soundEnabled: true
  });

  const [state, setState] = useState<PomodoroState>({
    isActive: false,
    isPaused: false,
    currentPhase: 'work',
    timeRemaining: 25 * 60, // 25 minutes in seconds
    completedPomodoros: 0,
    currentPomodoro: 1
  });

  const [showSettings, setShowSettings] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: number | null = null;

    if (state.isActive && !state.isPaused) {
      interval = setInterval(() => {
        setState(prev => {
          if (prev.timeRemaining <= 1) {
            // Timer finished
            handleTimerComplete();
            return prev;
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isActive, state.isPaused]);

  const handleTimerComplete = useCallback(() => {
    const { currentPhase, completedPomodoros, currentPomodoro } = state;
    
    if (currentPhase === 'work') {
      // Work session completed
      const newCompletedPomodoros = completedPomodoros + 1;
      const shouldTakeLongBreak = newCompletedPomodoros % settings.longBreakInterval === 0;
      
      onSessionEnd();
      
      if (shouldTakeLongBreak) {
        // Long break
        setState(prev => ({
          ...prev,
          isActive: settings.autoStartBreaks,
          currentPhase: 'longBreak',
          timeRemaining: settings.longBreakDuration * 60,
          completedPomodoros: newCompletedPomodoros,
          currentPomodoro: currentPomodoro + 1
        }));
        onBreakStart();
      } else {
        // Short break
        setState(prev => ({
          ...prev,
          isActive: settings.autoStartBreaks,
          currentPhase: 'shortBreak',
          timeRemaining: settings.breakDuration * 60,
          completedPomodoros: newCompletedPomodoros,
          currentPomodoro: currentPomodoro + 1
        }));
        onBreakStart();
      }
    } else {
      // Break completed
      onBreakEnd();
      setState(prev => ({
        ...prev,
        isActive: settings.autoStartPomodoros,
        currentPhase: 'work',
        timeRemaining: settings.workDuration * 60
      }));
      onSessionStart();
    }
  }, [state, settings, onSessionStart, onSessionEnd, onBreakStart, onBreakEnd]);

  const startTimer = useCallback(() => {
    setState(prev => ({ ...prev, isActive: true, isPaused: false }));
  }, []);

  const pauseTimer = useCallback(() => {
    setState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  }, []);

  const stopTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      timeRemaining: settings.workDuration * 60,
      currentPhase: 'work'
    }));
  }, [settings.workDuration]);

  const resetTimer = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      isPaused: false,
      timeRemaining: settings.workDuration * 60,
      currentPhase: 'work',
      completedPomodoros: 0,
      currentPomodoro: 1
    }));
  }, [settings.workDuration]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const getPhaseColor = useCallback(() => {
    switch (state.currentPhase) {
      case 'work': return 'text-red-500';
      case 'shortBreak': return 'text-green-500';
      case 'longBreak': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  }, [state.currentPhase]);

  const getPhaseBgColor = useCallback(() => {
    switch (state.currentPhase) {
      case 'work': return 'bg-red-50 border-red-200';
      case 'shortBreak': return 'bg-green-50 border-green-200';
      case 'longBreak': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  }, [state.currentPhase]);

  const getProgressPercentage = useCallback(() => {
    const totalTime = state.currentPhase === 'work' 
      ? settings.workDuration * 60
      : state.currentPhase === 'longBreak'
        ? settings.longBreakDuration * 60
        : settings.breakDuration * 60;
    
    return ((totalTime - state.timeRemaining) / totalTime) * 100;
  }, [state.timeRemaining, state.currentPhase, settings]);

  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-black flex items-center gap-2">
          <Clock className="w-6 h-6" />
          Pomodoro Timer
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200"
          >
            <h4 className="font-semibold text-black mb-3">Timer Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Work Duration (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, workDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Break Duration (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={settings.breakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Break (min)
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakDuration: parseInt(e.target.value) }))}
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
                  value={settings.longBreakInterval}
                  onChange={(e) => setSettings(prev => ({ ...prev, longBreakInterval: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoStartBreaks}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoStartBreaks: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Auto-start breaks</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={settings.autoStartPomodoros}
                  onChange={(e) => setSettings(prev => ({ ...prev, autoStartPomodoros: e.target.checked }))}
                  className="rounded"
                />
                <span className="text-sm text-gray-700">Auto-start pomodoros</span>
              </label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timer Display */}
      <div className={`text-center p-6 rounded-xl border-2 ${getPhaseBgColor()}`}>
        <div className="mb-4">
          <div className={`text-6xl font-bold ${getPhaseColor()} mb-2`}>
            {formatTime(state.timeRemaining)}
          </div>
          <div className="text-lg font-semibold text-gray-700 capitalize">
            {state.currentPhase === 'work' ? 'Focus Time' : 
             state.currentPhase === 'shortBreak' ? 'Short Break' : 'Long Break'}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <motion.div
            className={`h-2 rounded-full ${
              state.currentPhase === 'work' ? 'bg-red-500' :
              state.currentPhase === 'shortBreak' ? 'bg-green-500' : 'bg-blue-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${getProgressPercentage()}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 mb-6 text-sm text-gray-600">
          <div>
            <div className="font-semibold">Pomodoro</div>
            <div>{state.currentPomodoro}</div>
          </div>
          <div>
            <div className="font-semibold">Completed</div>
            <div>{state.completedPomodoros}</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3">
          {!state.isActive ? (
            <button
              onClick={startTimer}
              className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              <Play className="w-5 h-5" />
              Start
            </button>
          ) : (
            <button
              onClick={pauseTimer}
              className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-semibold"
            >
              {state.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
              {state.isPaused ? 'Resume' : 'Pause'}
            </button>
          )}
          
          <button
            onClick={stopTimer}
            className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
          >
            <Square className="w-5 h-5" />
            Stop
          </button>
          
          <button
            onClick={resetTimer}
            className="flex items-center gap-2 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
});

PomodoroTimer.displayName = 'PomodoroTimer';

export default PomodoroTimer;
