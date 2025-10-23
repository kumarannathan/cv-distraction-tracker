import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Smartphone, 
  Eye, 
  Users, 
  Volume2, 
  Coffee, 
  AlertTriangle,
  TrendingUp,
  BarChart3,
  Target,
  Clock,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface DistractionEvent {
  id: string;
  type: DistractionType;
  timestamp: number;
  duration: number; // in seconds
  context?: string;
  severity: 'low' | 'medium' | 'high';
}

type DistractionType = 'phone' | 'looking_away' | 'person_entering' | 'noise' | 'coffee_break' | 'other';

interface DistractionStats {
  totalDistractions: number;
  averagePerSession: number;
  mostCommonType: DistractionType;
  peakDistractionHour: number;
  weeklyTrend: number;
  totalTimeLost: number; // in minutes
  typeBreakdown: Record<DistractionType, number>;
  hourlyPattern: Array<{ hour: number; count: number }>;
  severityBreakdown: Record<string, number>;
}

interface DistractionTrackerProps {
  onDistractionDetected: (type: DistractionType, severity: 'low' | 'medium' | 'high') => void;
  currentSessionDistractions: number;
}

const DistractionTracker: React.FC<DistractionTrackerProps> = memo(({ 
  onDistractionDetected, 
  currentSessionDistractions 
}) => {
  const [distractions, setDistractions] = useState<DistractionEvent[]>([
    {
      id: '1',
      type: 'phone',
      timestamp: Date.now() - 3600000,
      duration: 120,
      context: 'Notification check',
      severity: 'medium'
    },
    {
      id: '2',
      type: 'looking_away',
      timestamp: Date.now() - 7200000,
      duration: 30,
      context: 'Window distraction',
      severity: 'low'
    },
    {
      id: '3',
      type: 'person_entering',
      timestamp: Date.now() - 10800000,
      duration: 180,
      context: 'Colleague interruption',
      severity: 'high'
    },
    {
      id: '4',
      type: 'noise',
      timestamp: Date.now() - 14400000,
      duration: 60,
      context: 'Construction outside',
      severity: 'medium'
    },
    {
      id: '5',
      type: 'coffee_break',
      timestamp: Date.now() - 18000000,
      duration: 300,
      context: 'Planned break',
      severity: 'low'
    }
  ]);

  const [showAddDistraction, setShowAddDistraction] = useState(false);
  const [newDistraction, setNewDistraction] = useState<Partial<DistractionEvent>>({
    type: 'other',
    duration: 60,
    context: '',
    severity: 'medium'
  });

  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('week');
  const [showInsights, setShowInsights] = useState(false);

  const distractionTypes = {
    phone: { label: 'Phone Check', icon: Smartphone, color: '#EF4444' },
    looking_away: { label: 'Looking Away', icon: Eye, color: '#F97316' },
    person_entering: { label: 'Person Entering', icon: Users, color: '#EAB308' },
    noise: { label: 'Noise', icon: Volume2, color: '#22C55E' },
    coffee_break: { label: 'Coffee Break', icon: Coffee, color: '#3B82F6' },
    other: { label: 'Other', icon: AlertTriangle, color: '#6B7280' }
  };

  const calculateStats = useCallback((): DistractionStats => {
    const now = Date.now();
    const timeframeMs = selectedTimeframe === 'today' ? 86400000 : 
                       selectedTimeframe === 'week' ? 604800000 : 2592000000;
    
    const filteredDistractions = distractions.filter(d => 
      now - d.timestamp <= timeframeMs
    );

    const typeBreakdown = Object.keys(distractionTypes).reduce((acc, type) => {
      acc[type as DistractionType] = filteredDistractions.filter(d => d.type === type).length;
      return acc;
    }, {} as Record<DistractionType, number>);

    const mostCommonType = Object.entries(typeBreakdown).reduce((a, b) => 
      typeBreakdown[a[0] as DistractionType] > typeBreakdown[b[0] as DistractionType] ? a : b
    )[0] as DistractionType;

    const hourlyPattern = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: filteredDistractions.filter(d => 
        new Date(d.timestamp).getHours() === hour
      ).length
    }));

    const severityBreakdown = filteredDistractions.reduce((acc, d) => {
      acc[d.severity] = (acc[d.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalTimeLost = filteredDistractions.reduce((sum, d) => sum + d.duration, 0) / 60;

    return {
      totalDistractions: filteredDistractions.length,
      averagePerSession: filteredDistractions.length / Math.max(1, Math.floor(timeframeMs / 3600000)),
      mostCommonType,
      peakDistractionHour: hourlyPattern.reduce((a, b) => a.count > b.count ? a : b).hour,
      weeklyTrend: 12, // Mock data
      totalTimeLost,
      typeBreakdown,
      hourlyPattern,
      severityBreakdown
    };
  }, [distractions, selectedTimeframe, distractionTypes]);

  const stats = calculateStats();

  const addDistraction = useCallback(() => {
    if (!newDistraction.type) return;

    const distraction: DistractionEvent = {
      id: Date.now().toString(),
      type: newDistraction.type as DistractionType,
      timestamp: Date.now(),
      duration: newDistraction.duration || 60,
      context: newDistraction.context || '',
      severity: newDistraction.severity || 'medium'
    };

    setDistractions(prev => [distraction, ...prev]);
    onDistractionDetected(distraction.type, distraction.severity);
    
    setNewDistraction({
      type: 'other',
      duration: 60,
      context: '',
      severity: 'medium'
    });
    setShowAddDistraction(false);
  }, [newDistraction, onDistractionDetected]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  }, []);

  const getSeverityColor = useCallback((severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }, []);

  const getInsights = useCallback(() => {
    const insights = [];
    
    if (stats.mostCommonType === 'phone') {
      insights.push({
        type: 'warning',
        title: 'Phone Distractions',
        message: 'Consider using focus mode or putting your phone in another room during work sessions.',
        icon: Smartphone
      });
    }
    
    if (stats.peakDistractionHour >= 14 && stats.peakDistractionHour <= 16) {
      insights.push({
        type: 'info',
        title: 'Afternoon Slump',
        message: 'You tend to get distracted more in the afternoon. Consider scheduling lighter tasks during this time.',
        icon: Clock
      });
    }
    
    if (stats.totalTimeLost > 60) {
      insights.push({
        type: 'alert',
        title: 'Time Loss Alert',
        message: `You've lost ${Math.round(stats.totalTimeLost)} minutes to distractions this ${selectedTimeframe}.`,
        icon: AlertTriangle
      });
    }
    
    return insights;
  }, [stats, selectedTimeframe]);

  const insights = getInsights();

  // Chart data
  const pieData = Object.entries(stats.typeBreakdown).map(([type, count]) => ({
    name: distractionTypes[type as DistractionType].label,
    value: count,
    color: distractionTypes[type as DistractionType].color
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <AlertTriangle className="w-6 h-6" />
            Distraction Tracker
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => setShowInsights(!showInsights)}
              className={`px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
                showInsights ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Insights
            </button>
            <button
              onClick={() => setShowAddDistraction(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-semibold"
            >
              Log Distraction
            </button>
          </div>
        </div>

        {/* Timeframe Selector */}
        <div className="flex gap-2 mb-6">
          {(['today', 'week', 'month'] as const).map(timeframe => (
            <button
              key={timeframe}
              onClick={() => setSelectedTimeframe(timeframe)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedTimeframe === timeframe 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </button>
          ))}
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-xl border border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.totalDistractions}</div>
            <div className="text-sm text-red-700">Total Distractions</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-xl border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">{Math.round(stats.totalTimeLost)}m</div>
            <div className="text-sm text-orange-700">Time Lost</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">{stats.peakDistractionHour}:00</div>
            <div className="text-sm text-yellow-700">Peak Hour</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{currentSessionDistractions}</div>
            <div className="text-sm text-blue-700">This Session</div>
          </div>
        </div>
      </div>

      {/* Insights Panel */}
      <AnimatePresence>
        {showInsights && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg"
          >
            <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Personalized Insights
            </h3>
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl border-2 ${
                    insight.type === 'alert' ? 'bg-red-50 border-red-200' :
                    insight.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <insight.icon className={`w-6 h-6 mt-1 ${
                      insight.type === 'alert' ? 'text-red-600' :
                      insight.type === 'warning' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`} />
                    <div>
                      <h4 className="font-semibold text-black mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-700">{insight.message}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distraction Types */}
        <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Distraction Types
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Hourly Pattern */}
        <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
          <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Hourly Pattern
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#EF4444" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Distractions */}
      <div className="bg-white rounded-2xl p-6 border-2 border-black shadow-lg">
        <h3 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Recent Distractions
        </h3>
        <div className="space-y-3">
          {distractions.slice(0, 10).map((distraction, index) => {
            const typeInfo = distractionTypes[distraction.type];
            const Icon = typeInfo.icon;
            
            return (
              <motion.div
                key={distraction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: typeInfo.color + '20' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: typeInfo.color }} />
                  </div>
                  <div>
                    <div className="font-semibold text-black">{typeInfo.label}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(distraction.timestamp).toLocaleString()}
                    </div>
                    {distraction.context && (
                      <div className="text-xs text-gray-500">{distraction.context}</div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-black">{formatTime(distraction.duration)}</div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(distraction.severity)}`}>
                    {distraction.severity}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Add Distraction Modal */}
      <AnimatePresence>
        {showAddDistraction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowAddDistraction(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md border-2 border-black shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-bold text-black mb-4">Log Distraction</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Distraction Type
                  </label>
                  <select
                    value={newDistraction.type || 'other'}
                    onChange={(e) => setNewDistraction(prev => ({ ...prev, type: e.target.value as DistractionType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {Object.entries(distractionTypes).map(([key, info]) => (
                      <option key={key} value={key}>{info.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newDistraction.duration || 60}
                    onChange={(e) => setNewDistraction(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Context (optional)
                  </label>
                  <input
                    type="text"
                    value={newDistraction.context || ''}
                    onChange={(e) => setNewDistraction(prev => ({ ...prev, context: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="What caused the distraction?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Severity
                  </label>
                  <select
                    value={newDistraction.severity || 'medium'}
                    onChange={(e) => setNewDistraction(prev => ({ ...prev, severity: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddDistraction(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addDistraction}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
                >
                  Log Distraction
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

DistractionTracker.displayName = 'DistractionTracker';

export default DistractionTracker;
