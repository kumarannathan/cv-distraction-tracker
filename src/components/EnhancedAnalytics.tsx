import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  Target, 
  BarChart3, 
  PieChart, 
  Activity,
  Eye,
  Brain,
  Zap
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

interface SessionData {
  id: string;
  date: string;
  duration: number; // in minutes
  focusedTime: number; // in minutes
  averageScore: number;
  distractions: number;
  peakHours: string[];
  focusPattern: 'morning' | 'afternoon' | 'evening' | 'mixed';
}

interface AnalyticsData {
  totalSessions: number;
  totalFocusTime: number;
  averageSessionLength: number;
  averageFocusScore: number;
  bestStreak: number;
  currentStreak: number;
  peakProductivityHour: number;
  weeklyTrend: number;
  monthlyTrend: number;
  focusPatterns: {
    morning: number;
    afternoon: number;
    evening: number;
    mixed: number;
  };
  distractionTypes: {
    phone: number;
    lookingAway: number;
    personEntering: number;
    noise: number;
    other: number;
  };
}

const EnhancedAnalytics: React.FC<{
  sessionHistory: any[];
  isOpen: boolean;
  onClose: () => void;
}> = memo(({ sessionHistory, isOpen, onClose }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedView, setSelectedView] = useState<'overview' | 'trends' | 'patterns' | 'calendar'>('overview');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);

  // Mock data for demonstration
  const mockSessionData: SessionData[] = [
    { id: '1', date: '2024-01-20', duration: 45, focusedTime: 38, averageScore: 87, distractions: 3, peakHours: ['10:00', '14:00'], focusPattern: 'morning' },
    { id: '2', date: '2024-01-19', duration: 32, focusedTime: 28, averageScore: 82, distractions: 5, peakHours: ['09:00'], focusPattern: 'morning' },
    { id: '3', date: '2024-01-18', duration: 67, focusedTime: 58, averageScore: 91, distractions: 2, peakHours: ['10:00', '15:00'], focusPattern: 'mixed' },
    { id: '4', date: '2024-01-17', duration: 0, focusedTime: 0, averageScore: 0, distractions: 0, peakHours: [], focusPattern: 'mixed' },
    { id: '5', date: '2024-01-16', duration: 52, focusedTime: 45, averageScore: 89, distractions: 4, peakHours: ['11:00'], focusPattern: 'afternoon' },
    { id: '6', date: '2024-01-15', duration: 38, focusedTime: 32, averageScore: 85, distractions: 3, peakHours: ['09:00'], focusPattern: 'morning' },
    { id: '7', date: '2024-01-14', duration: 71, focusedTime: 63, averageScore: 93, distractions: 1, peakHours: ['10:00', '16:00'], focusPattern: 'mixed' },
  ];

  const mockAnalyticsData: AnalyticsData = {
    totalSessions: 156,
    totalFocusTime: 2840,
    averageSessionLength: 42,
    averageFocusScore: 87,
    bestStreak: 15,
    currentStreak: 7,
    peakProductivityHour: 10,
    weeklyTrend: 12,
    monthlyTrend: 8,
    focusPatterns: {
      morning: 45,
      afternoon: 30,
      evening: 15,
      mixed: 10
    },
    distractionTypes: {
      phone: 35,
      lookingAway: 25,
      personEntering: 20,
      noise: 15,
      other: 5
    }
  };

  useEffect(() => {
    setAnalyticsData(mockAnalyticsData);
  }, []);

  const formatTime = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  }, []);

  const getTrendColor = useCallback((trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  }, []);

  const getTrendIcon = useCallback((trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend < 0) return <TrendingUp className="w-4 h-4 rotate-180" />;
    return <Activity className="w-4 h-4" />;
  }, []);

  // Chart data preparation
  const weeklyData = mockSessionData.map(session => ({
    date: new Date(session.date).toLocaleDateString('en-US', { weekday: 'short' }),
    focusTime: session.focusedTime,
    totalTime: session.duration,
    score: session.averageScore,
    distractions: session.distractions
  }));

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    sessions: Math.floor(Math.random() * 5),
    avgScore: 70 + Math.random() * 30
  }));

  const focusPatternData = [
    { name: 'Morning', value: mockAnalyticsData.focusPatterns.morning, color: '#3B82F6' },
    { name: 'Afternoon', value: mockAnalyticsData.focusPatterns.afternoon, color: '#10B981' },
    { name: 'Evening', value: mockAnalyticsData.focusPatterns.evening, color: '#F59E0B' },
    { name: 'Mixed', value: mockAnalyticsData.focusPatterns.mixed, color: '#8B5CF6' }
  ];

  const distractionData = [
    { name: 'Phone', value: mockAnalyticsData.distractionTypes.phone, color: '#EF4444' },
    { name: 'Looking Away', value: mockAnalyticsData.distractionTypes.lookingAway, color: '#F97316' },
    { name: 'Person Entering', value: mockAnalyticsData.distractionTypes.personEntering, color: '#EAB308' },
    { name: 'Noise', value: mockAnalyticsData.distractionTypes.noise, color: '#22C55E' },
    { name: 'Other', value: mockAnalyticsData.distractionTypes.other, color: '#6B7280' }
  ];

  if (!isOpen || !analyticsData) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border-2 border-black shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-black flex items-center gap-2">
              <BarChart3 className="w-7 h-7" />
              Enhanced Analytics
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'overview', label: 'Overview', icon: Activity },
              { id: 'trends', label: 'Trends', icon: TrendingUp },
              { id: 'patterns', label: 'Patterns', icon: PieChart },
              { id: 'calendar', label: 'Calendar', icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedView(id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  selectedView === id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mt-4">
            {['week', 'month', 'quarter', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period as any)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedPeriod === period 
                    ? 'bg-gray-800 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <AnimatePresence mode="wait">
            {selectedView === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Total Focus Time</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{formatTime(analyticsData.totalFocusTime)}</div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Average Score</span>
                    </div>
                    <div className="text-2xl font-bold text-green-900">{analyticsData.averageFocusScore}%</div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-purple-600" />
                      <span className="text-sm font-medium text-purple-800">Current Streak</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">{analyticsData.currentStreak} days</div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="w-5 h-5 text-orange-600" />
                      <span className="text-sm font-medium text-orange-800">Peak Hour</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">{analyticsData.peakProductivityHour}:00</div>
                  </div>
                </div>

                {/* Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-black mb-4">Weekly Trend</h3>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${getTrendColor(analyticsData.weeklyTrend)}`}>
                        {getTrendIcon(analyticsData.weeklyTrend)}
                        <span className="font-semibold">{Math.abs(analyticsData.weeklyTrend)}%</span>
                      </div>
                      <span className="text-sm text-gray-600">vs last week</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-black mb-4">Monthly Trend</h3>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${getTrendColor(analyticsData.monthlyTrend)}`}>
                        {getTrendIcon(analyticsData.monthlyTrend)}
                        <span className="font-semibold">{Math.abs(analyticsData.monthlyTrend)}%</span>
                      </div>
                      <span className="text-sm text-gray-600">vs last month</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {selectedView === 'trends' && (
              <motion.div
                key="trends"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Weekly Focus Time Chart */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-black mb-4">Weekly Focus Time</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="focusTime" stroke="#3B82F6" strokeWidth={3} />
                      <Line type="monotone" dataKey="totalTime" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Hourly Productivity */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-black mb-4">Hourly Productivity</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="avgScore" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {selectedView === 'patterns' && (
              <motion.div
                key="patterns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Focus Patterns */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-black mb-4">Focus Time Patterns</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={focusPatternData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {focusPatternData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Distraction Types */}
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-black mb-4">Distraction Types</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={distractionData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {distractionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            )}

            {selectedView === 'calendar' && (
              <motion.div
                key="calendar"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-black mb-4">Focus Calendar</h3>
                  <div className="text-center text-gray-500 py-12">
                    Calendar view coming soon...
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
});

EnhancedAnalytics.displayName = 'EnhancedAnalytics';

export default EnhancedAnalytics;
