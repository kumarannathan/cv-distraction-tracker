import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Trophy, Calendar, Flame, Star, Award, Zap } from 'lucide-react';

interface DailyGoal {
  id: string;
  name: string;
  targetMinutes: number;
  currentMinutes: number;
  completed: boolean;
  streak: number;
}

interface FocusStreak {
  date: string;
  totalMinutes: number;
  sessions: number;
  averageScore: number;
  completed: boolean;
}

interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  completionRate: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

const FocusStreaks: React.FC<{
  todayFocusTime: number;
  onGoalUpdate: (goal: DailyGoal) => void;
}> = memo(({ todayFocusTime, onGoalUpdate }) => {
  const [dailyGoals, setDailyGoals] = useState<DailyGoal[]>([
    {
      id: '1',
      name: 'Daily Focus',
      targetMinutes: 120,
      currentMinutes: 0,
      completed: false,
      streak: 0
    },
    {
      id: '2',
      name: 'Deep Work',
      targetMinutes: 60,
      currentMinutes: 0,
      completed: false,
      streak: 0
    }
  ]);

  const [streakStats, setStreakStats] = useState<StreakStats>({
    currentStreak: 7,
    longestStreak: 15,
    totalDays: 23,
    completionRate: 78,
    weeklyGoal: 600,
    weeklyProgress: 420
  });

  const [focusHistory, setFocusHistory] = useState<FocusStreak[]>([
    { date: '2024-01-20', totalMinutes: 135, sessions: 4, averageScore: 87, completed: true },
    { date: '2024-01-19', totalMinutes: 98, sessions: 3, averageScore: 82, completed: true },
    { date: '2024-01-18', totalMinutes: 156, sessions: 5, averageScore: 91, completed: true },
    { date: '2024-01-17', totalMinutes: 0, sessions: 0, averageScore: 0, completed: false },
    { date: '2024-01-16', totalMinutes: 142, sessions: 4, averageScore: 89, completed: true },
    { date: '2024-01-15', totalMinutes: 118, sessions: 3, averageScore: 85, completed: true },
    { date: '2024-01-14', totalMinutes: 167, sessions: 6, averageScore: 93, completed: true }
  ]);

  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [editingGoal, setEditingGoal] = useState<DailyGoal | null>(null);

  // Update daily goals with current focus time
  useEffect(() => {
    setDailyGoals(prev => prev.map(goal => ({
      ...goal,
      currentMinutes: todayFocusTime,
      completed: todayFocusTime >= goal.targetMinutes
    })));
  }, [todayFocusTime]);

  const getStreakColor = useCallback((streak: number) => {
    if (streak >= 30) return 'text-purple-600';
    if (streak >= 14) return 'text-blue-600';
    if (streak >= 7) return 'text-green-600';
    if (streak >= 3) return 'text-yellow-600';
    return 'text-gray-600';
  }, []);

  const getStreakIcon = useCallback((streak: number) => {
    if (streak >= 30) return <Award className="w-6 h-6" />;
    if (streak >= 14) return <Trophy className="w-6 h-6" />;
    if (streak >= 7) return <Star className="w-6 h-6" />;
    if (streak >= 3) return <Flame className="w-6 h-6" />;
    return <Zap className="w-6 h-6" />;
  }, []);

  const getProgressColor = useCallback((percentage: number) => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  }, []);

  const addNewGoal = useCallback(() => {
    const newGoal: DailyGoal = {
      id: Date.now().toString(),
      name: 'New Goal',
      targetMinutes: 60,
      currentMinutes: 0,
      completed: false,
      streak: 0
    };
    setEditingGoal(newGoal);
    setShowGoalEditor(true);
  }, []);

  const saveGoal = useCallback((goal: DailyGoal) => {
    if (editingGoal?.id === goal.id) {
      // Editing existing goal
      setDailyGoals(prev => prev.map(g => g.id === goal.id ? goal : g));
    } else {
      // Adding new goal
      setDailyGoals(prev => [...prev, goal]);
    }
    setShowGoalEditor(false);
    setEditingGoal(null);
    onGoalUpdate(goal);
  }, [editingGoal, onGoalUpdate]);

  const deleteGoal = useCallback((goalId: string) => {
    setDailyGoals(prev => prev.filter(g => g.id !== goalId));
  }, []);

  const formatTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  return (
    <div className="space-y-6">
      {/* Streak Overview */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Flame className="w-6 h-6" />
            Focus Streaks
          </h3>
          <div className={`flex items-center gap-2 ${getStreakColor(streakStats.currentStreak)}`}>
            {getStreakIcon(streakStats.currentStreak)}
            <span className="font-bold text-2xl">{streakStats.currentStreak}</span>
            <span className="text-sm">days</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-black">{streakStats.currentStreak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-black">{streakStats.longestStreak}</div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-black">{streakStats.totalDays}</div>
            <div className="text-sm text-gray-600">Total Days</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <div className="text-2xl font-bold text-black">{streakStats.completionRate}%</div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
        </div>

        {/* Weekly Progress */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Weekly Goal</span>
            <span className="text-sm text-gray-600">
              {formatTime(streakStats.weeklyProgress)} / {formatTime(streakStats.weeklyGoal)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              className={`h-3 rounded-full ${getProgressColor((streakStats.weeklyProgress / streakStats.weeklyGoal) * 100)}`}
              initial={{ width: 0 }}
              animate={{ width: `${(streakStats.weeklyProgress / streakStats.weeklyGoal) * 100}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Daily Goals */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Target className="w-6 h-6" />
            Daily Goals
          </h3>
          <button
            onClick={addNewGoal}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-semibold"
          >
            Add Goal
          </button>
        </div>

        <div className="space-y-4">
          {dailyGoals.map((goal) => {
            const progress = (goal.currentMinutes / goal.targetMinutes) * 100;
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border-2 ${
                  goal.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                    <h4 className="font-semibold text-black">{goal.name}</h4>
                    {goal.completed && <Trophy className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setShowGoalEditor(true);
                      }}
                      className="text-gray-500 hover:text-gray-700 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    {formatTime(goal.currentMinutes)} / {formatTime(goal.targetMinutes)}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${getProgressColor(progress)}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>

                {goal.streak > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-sm text-gray-600">
                    <Flame className="w-4 h-4" />
                    <span>{goal.streak} day streak</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Recent History */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <h3 className="text-xl font-bold text-black flex items-center gap-2 mb-6">
          <Calendar className="w-6 h-6" />
          Recent History
        </h3>

        <div className="space-y-3">
          {focusHistory.slice(0, 7).map((day, index) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg ${
                day.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${day.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                <div>
                  <div className="font-medium text-black">
                    {new Date(day.date).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {day.sessions} sessions • {day.averageScore}% avg
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-black">{formatTime(day.totalMinutes)}</div>
                {day.completed && <Trophy className="w-4 h-4 text-green-500 ml-auto" />}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Goal Editor Modal */}
      <AnimatePresence>
        {showGoalEditor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowGoalEditor(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-black mb-4">
                {editingGoal?.id ? 'Edit Goal' : 'Add New Goal'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    value={editingGoal?.name || ''}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Deep Work, Study Time"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Minutes
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="480"
                    value={editingGoal?.targetMinutes || 60}
                    onChange={(e) => setEditingGoal(prev => prev ? { ...prev, targetMinutes: parseInt(e.target.value) } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGoalEditor(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => editingGoal && saveGoal(editingGoal)}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
                >
                  Save Goal
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

FocusStreaks.displayName = 'FocusStreaks';

export default FocusStreaks;
