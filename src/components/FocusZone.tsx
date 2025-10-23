import React, { useRef, useEffect, useState, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Eye, Hand, Clock, TrendingUp, Play, Pause, Square, Target } from 'lucide-react';
import PomodoroTimer from './PomodoroTimer';
import FocusStreaks from './FocusStreaks';
import EnhancedAnalytics from './EnhancedAnalytics';
import TaskManager from './TaskManager';
import DistractionTracker from './DistractionTracker';
import AmbientSounds from './AmbientSounds';
import BreakReminders from './BreakReminders';
import FocusModes from './FocusModes';

interface FocusData {
  duration: number;
  focusedTime: number;
  distractions: number;
  focusPercentage: number;
  timestamp: number;
}

interface SessionStats {
  totalSessions: number;
  totalFocusTime: number;
  averageFocusScore: number;
  bestStreak: number;
  currentStreak: number;
}

const FocusZone: React.FC = memo(() => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // MediaPipe refs
  const faceMeshRef = useRef<FaceMesh | null>(null);
  const handsRef = useRef<Hands | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  
  // Focus tracking state
  const [focusScore, setFocusScore] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [currentGesture, setCurrentGesture] = useState('NONE');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [focusedTime, setFocusedTime] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [lastFocusState, setLastFocusState] = useState(true);
  
  // Analytics state
  const [sessionHistory, setSessionHistory] = useState<FocusData[]>([]);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSessions: 0,
    totalFocusTime: 0,
    averageFocusScore: 0,
    bestStreak: 0,
    currentStreak: 0
  });
  const [showSessionHistory, setShowSessionHistory] = useState(false);
  
  // UI state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPaused, setCameraPaused] = useState(false);
  const [handInFrame, setHandInFrame] = useState(false);
  
  // New feature states
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showStreaks, setShowStreaks] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [showDistractions, setShowDistractions] = useState(false);
  const [showAmbientSounds, setShowAmbientSounds] = useState(false);
  const [showBreakReminders, setShowBreakReminders] = useState(false);
  const [showFocusModes, setShowFocusModes] = useState(false);
  const [currentFeaturePage, setCurrentFeaturePage] = useState(0);
  const [currentAppPage, setCurrentAppPage] = useState(0); // 0 = main, 1 = features
  const [pomodoroActive, setPomodoroActive] = useState(false);
  const [pomodoroPhase, setPomodoroPhase] = useState<'work' | 'break'>('work');
  
  // Task management
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>();
  const [currentFocusMode, setCurrentFocusMode] = useState<string | undefined>();
  const [sessionStartTime, setSessionStartTime] = useState(0);
  
  // Gesture settings
  const [gestureSettings, setGestureSettings] = useState({
    pauseToggle: true, // true = toggle on gesture, false = hold gesture
    enableStartGesture: false, // hide start gesture for now
    gestureSensitivity: 0.7 // how long to hold gesture before triggering
  });
  
  // Gesture state tracking
  const [gestureHoldTime, setGestureHoldTime] = useState(0);
  const [lastGesture, setLastGesture] = useState('NONE');
  const [gestureTriggered, setGestureTriggered] = useState(false);
  const [lastTriggeredGesture, setLastTriggeredGesture] = useState('NONE');
  const [isHoldingPauseGesture, setIsHoldingPauseGesture] = useState(false);

  // Gesture controls mapping
  const gestureControls = useMemo(() => {
    const controls = [
      { gesture: 'OPEN_PALM', icon: '✋', action: 'Pause/Resume', color: 'text-yellow-400' },
      { gesture: 'PEACE', icon: '✌️', action: 'End Session', color: 'text-red-400' },
      { gesture: 'THUMBS_UP', icon: '👍', action: 'Mark Productive', color: 'text-blue-400' },
      { gesture: 'THUMBS_DOWN', icon: '👎', action: 'Mark Break', color: 'text-purple-400' }
    ];
    
    // Only show start gesture if enabled
    if (gestureSettings.enableStartGesture) {
      controls.unshift({ gesture: 'FIST', icon: '✊', action: 'Start Session', color: 'text-green-400' });
    }
    
    return controls;
  }, [gestureSettings.enableStartGesture]);

  // Session timer effect
  useEffect(() => {
    if (!sessionActive || sessionPaused || isHoldingPauseGesture) return;
    
    const interval = setInterval(() => {
      setSessionTime(prev => prev + 1);
      if (isFocused) {
        setFocusedTime(prev => prev + 1);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sessionActive, sessionPaused, isFocused, isHoldingPauseGesture]);

  // Initialize MediaPipe
  const initializeMediaPipe = useCallback(async () => {
    try {
      if (!videoRef.current) return;

      // Initialize Face Mesh
      const faceMesh = new FaceMesh({
        locateFile: (file) => 
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });
      
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      
      faceMesh.onResults(onFaceResults);
      faceMeshRef.current = faceMesh;
      
      // Initialize Hands
      const hands = new Hands({
        locateFile: (file) => 
          `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });
      
      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
      });
      
      hands.onResults(onHandResults);
      handsRef.current = hands;
      
      // Start camera
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshRef.current && handsRef.current && videoRef.current) {
            await faceMeshRef.current.send({image: videoRef.current});
            await handsRef.current.send({image: videoRef.current});
          }
        },
        width: 1280,
        height: 720
      });
      
      cameraRef.current = camera;
      await camera.start();
    } catch (error) {
      console.error('Error initializing MediaPipe:', error);
      setCameraError('Failed to initialize camera. Please check permissions.');
    }
  }, []);

  // Face detection results handler
  const onFaceResults = useCallback((results: any) => {
    if (cameraPaused) return;
    
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      setIsFocused(false);
      setFocusScore(0);
      return;
    }
    
    const landmarks = results.multiFaceLandmarks[0];
    const focus = calculateFocusScore(landmarks);
    
    setFocusScore(focus.score);
    setIsFocused(focus.focused);
    
    // Track distractions
    if (lastFocusState && !focus.focused) {
      setDistractionCount(prev => prev + 1);
    }
    setLastFocusState(focus.focused);
    
    drawCanvas(results.image, landmarks, null);
  }, [lastFocusState, cameraPaused]);

  // Hand detection results handler
  const onHandResults = useCallback((results: any) => {
    if (cameraPaused) return;
    
    if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setCurrentGesture('NONE');
      setLastGesture('NONE');
      setGestureHoldTime(0);
      setGestureTriggered(false);
      setIsHoldingPauseGesture(false);
      setHandInFrame(false);
      return;
    }
    
    // Hand detected in frame
    setHandInFrame(true);
    
    const landmarks = results.multiHandLandmarks[0];
    const gesture = detectGesture(landmarks);
    setCurrentGesture(gesture);
    
    // Handle open palm gesture for pause-while-holding
    if (gesture === 'OPEN_PALM' && sessionActive && !sessionPaused) {
      setIsHoldingPauseGesture(true);
    } else if (gesture !== 'OPEN_PALM') {
      setIsHoldingPauseGesture(false);
    }
    
    // Handle gesture hold time and triggering
    if (gesture === lastGesture && gesture !== 'NONE') {
      setGestureHoldTime(prev => prev + 1);
    } else {
      setGestureHoldTime(0);
      setGestureTriggered(false);
    }
    
    setLastGesture(gesture);
    
    // Trigger gesture if held long enough (convert seconds to frames at ~30fps)
    const requiredFrames = Math.max(5, gestureSettings.gestureSensitivity * 30);
    if (gesture !== 'NONE' && gestureHoldTime > requiredFrames && !gestureTriggered) {
      console.log('🚀 TRIGGERING GESTURE:', {
        gesture,
        gestureHoldTime,
        requiredFrames,
        sessionActive,
        sessionPaused
      });
      setGestureTriggered(true);
      setLastTriggeredGesture(gesture);
      handleGestureControl(gesture);
    }
    
    // Reset trigger when gesture changes
    if (gesture !== lastGesture) {
      setGestureTriggered(false);
    }
    
    // Don't draw hand landmarks, just keep the video feed clean
    drawCanvas(results.image, null, null);
  }, [cameraPaused, lastGesture, gestureHoldTime, gestureTriggered, gestureSettings.gestureSensitivity, sessionActive, sessionPaused]);

  // Session management functions
  const startSession = useCallback(() => {
    setSessionActive(true);
    setSessionPaused(false);
    setCameraPaused(false);
    setSessionTime(0);
    setFocusedTime(0);
    setDistractionCount(0);
    setSessionStartTime(Date.now());
  }, []);

  const resumeCamera = useCallback(() => {
    setCameraPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    console.log('🔄 TOGGLE PAUSE FUNCTION CALLED - Current state:', sessionPaused);
    setSessionPaused(prev => {
      const newState = !prev;
      console.log('✅ PAUSE STATE CHANGED FROM', prev, 'TO', newState);
      return newState;
    });
  }, [sessionPaused]);

  const updateSessionStats = useCallback((newSession: FocusData) => {
    setSessionStats(prev => {
      const newTotalSessions = prev.totalSessions + 1;
      const newTotalFocusTime = prev.totalFocusTime + newSession.focusedTime;
      const newAverageFocusScore = (prev.averageFocusScore * prev.totalSessions + newSession.focusPercentage) / newTotalSessions;
      
      return {
        totalSessions: newTotalSessions,
        totalFocusTime: newTotalFocusTime,
        averageFocusScore: newAverageFocusScore,
        bestStreak: Math.max(prev.bestStreak, newSession.focusedTime),
        currentStreak: newSession.focusPercentage > 70 ? prev.currentStreak + 1 : 0
      };
    });
  }, []);

  const endSession = useCallback(() => {
    console.log('🛑 END SESSION FUNCTION CALLED - Saving data:', { sessionTime, focusedTime, distractionCount });
    
    const sessionData: FocusData = {
      duration: sessionTime,
      focusedTime: focusedTime,
      distractions: distractionCount,
      focusPercentage: sessionTime > 0 ? (focusedTime / sessionTime) * 100 : 0,
      timestamp: Date.now()
    };
    
    console.log('💾 Session data to save:', sessionData);
    
    // Save to history
    setSessionHistory(prev => {
      const newHistory = [sessionData, ...prev];
      console.log('📚 Updated session history:', newHistory);
      return newHistory;
    });
    updateSessionStats(sessionData);
    
    // Reset all session data
    console.log('🔄 Resetting session data...');
    setSessionActive(false);
    setSessionPaused(false);
    setSessionTime(0);
    setFocusedTime(0);
    setDistractionCount(0);
    setIsHoldingPauseGesture(false);
    
    // Pause camera with overlay
    console.log('📷 Pausing camera with overlay...');
    setCameraPaused(true);
    
    // Resume camera after 3 seconds
    setTimeout(() => {
      console.log('📷 Resuming camera...');
      setCameraPaused(false);
    }, 3000);
  }, [sessionTime, focusedTime, distractionCount, updateSessionStats]);

  // Gesture control handler
  const handleGestureControl = useCallback((gesture: string) => {
    console.log('🎯 GESTURE CONTROL CALLED:', {
      gesture,
      sessionActive,
      sessionPaused,
      gestureSettings: gestureSettings.pauseToggle
    });
    
    switch (gesture) {
      case 'FIST':
        if (gestureSettings.enableStartGesture && !sessionActive) {
          console.log('✅ Starting session with fist gesture');
          startSession();
        } else {
          console.log('❌ Fist gesture ignored - start gesture disabled or session already active');
        }
        break;
      case 'OPEN_PALM':
        if (sessionActive) {
          console.log('✅ Toggling pause with open palm gesture');
          if (gestureSettings.pauseToggle) {
            console.log('🔄 Calling togglePause function');
            togglePause();
          } else {
            console.log('❌ Pause toggle disabled in settings');
          }
        } else {
          console.log('❌ Open palm gesture ignored - no active session');
        }
        break;
      case 'PEACE':
        if (sessionActive) {
          console.log('✅ Ending session with peace gesture');
          endSession();
        } else {
          console.log('❌ Peace gesture ignored - no active session');
        }
        break;
      case 'THUMBS_UP':
        console.log('👍 Productive moment marked with thumbs up');
        break;
      case 'THUMBS_DOWN':
        console.log('👎 Break time marked with thumbs down');
        break;
      default:
        console.log('❓ Unknown gesture:', gesture);
    }
  }, [sessionActive, sessionPaused, gestureSettings, startSession, togglePause, endSession]);

  // Focus score calculation
  const calculateFocusScore = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length < 468) {
      return { focused: false, score: 0 };
    }

    const leftEye = landmarks[468];
    const rightEye = landmarks[473];
    const noseTip = landmarks[1];
    const chin = landmarks[152];
    
    // Calculate head pose angles
    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    const centered = Math.abs(noseTip.x - 0.5) < 0.15;
    const lookingForward = Math.abs(noseTip.y - chin.y) > 0.1;
    
    const focused = centered && eyeDistance > 0.12 && lookingForward;
    const score = focused ? 85 + Math.random() * 15 : 20 + Math.random() * 30;
    
    return { 
      focused, 
      score: Math.round(score),
      direction: noseTip.x > 0.6 ? 'right' : noseTip.x < 0.4 ? 'left' : 'forward'
    };
  }, []);

  // Gesture detection with improved pose recognition
  const detectGesture = useCallback((landmarks: any[]) => {
    if (!landmarks || landmarks.length < 21) return 'NONE';
    
    // Get key landmark points
    const thumb_tip = landmarks[4];
    const thumb_ip = landmarks[3];
    const thumb_mcp = landmarks[2];
    const index_tip = landmarks[8];
    const index_pip = landmarks[6];
    const index_mcp = landmarks[5];
    const middle_tip = landmarks[12];
    const middle_pip = landmarks[10];
    const middle_mcp = landmarks[9];
    const ring_tip = landmarks[16];
    const ring_pip = landmarks[14];
    const ring_mcp = landmarks[13];
    const pinky_tip = landmarks[20];
    const pinky_pip = landmarks[18];
    const pinky_mcp = landmarks[17];
    const wrist = landmarks[0];
    
    // Calculate finger states (extended or not)
    const thumbUp = thumb_tip.y < thumb_ip.y;
    const indexUp = index_tip.y < index_pip.y;
    const middleUp = middle_tip.y < middle_pip.y;
    const ringUp = ring_tip.y < ring_pip.y;
    const pinkyUp = pinky_tip.y < pinky_pip.y;
    
    // Calculate distances for more accurate detection
    const thumbIndexDistance = Math.abs(thumb_tip.x - index_tip.x);
    const indexMiddleDistance = Math.abs(index_tip.x - middle_tip.x);
    const middleRingDistance = Math.abs(middle_tip.x - ring_tip.x);
    const ringPinkyDistance = Math.abs(ring_tip.x - pinky_tip.x);
    
    // FIST: All fingers down, thumb can be up or down
    const fistFingers = [indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;
    if (fistFingers === 0) {
      return 'FIST';
    }
    
    // OPEN_PALM: All fingers up and spread out
    const allFingersUp = [thumbUp, indexUp, middleUp, ringUp, pinkyUp].filter(Boolean).length;
    if (allFingersUp >= 4 && indexMiddleDistance > 0.05 && middleRingDistance > 0.05) {
      return 'OPEN_PALM';
    }
    
    // PEACE (V): Only index and middle fingers up, others down
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      // Make sure index and middle are reasonably spread
      if (indexMiddleDistance > 0.03) {
        return 'PEACE';
      }
    }
    
    // THUMBS_UP: Only thumb up, others down
    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      // Thumb should be pointing up (higher than wrist)
      if (thumb_tip.y < wrist.y) {
        return 'THUMBS_UP';
      }
    }
    
    // THUMBS_DOWN: Thumb pointing down
    if (thumbUp && !indexUp && !middleUp && !ringUp && !pinkyUp) {
      // Thumb should be pointing down (lower than wrist)
      if (thumb_tip.y > wrist.y) {
        return 'THUMBS_DOWN';
      }
    }
    
    return 'NONE';
  }, []);

  // Canvas drawing
  const drawCanvas = useCallback((image: any, faceLandmarks: any, handLandmarks: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (image) {
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    }
    
    // Draw face landmarks (minimal, just eye region)
    if (faceLandmarks) {
      ctx.fillStyle = isFocused ? '#10B981' : '#EF4444';
      [468, 473].forEach(idx => {
        const point = faceLandmarks[idx];
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          5, 0, 2 * Math.PI
        );
        ctx.fill();
      });
    }
    
    // Draw hand landmarks
    if (handLandmarks) {
      ctx.fillStyle = '#3B82F6';
      handLandmarks.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(
          point.x * canvas.width,
          point.y * canvas.height,
          4, 0, 2 * Math.PI
        );
        ctx.fill();
      });
    }
    
    ctx.restore();
  }, [isFocused]);

  // Initialize on mount
  useEffect(() => {
    initializeMediaPipe();
    
    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [initializeMediaPipe]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Format time helper
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Pomodoro timer callbacks
  const handlePomodoroSessionStart = useCallback(() => {
    setPomodoroActive(true);
    setPomodoroPhase('work');
    if (!sessionActive) {
      startSession();
    }
  }, [sessionActive]);

  const handlePomodoroSessionEnd = useCallback(() => {
    setPomodoroActive(false);
    setPomodoroPhase('work');
    if (sessionActive) {
      endSession();
    }
  }, [sessionActive]);

  const handlePomodoroBreakStart = useCallback(() => {
    setPomodoroPhase('break');
    if (sessionActive) {
      togglePause();
    }
  }, [sessionActive]);

  const handlePomodoroBreakEnd = useCallback(() => {
    setPomodoroPhase('work');
    if (sessionPaused) {
      togglePause();
    }
  }, [sessionPaused]);

  // Focus streaks callback
  const handleGoalUpdate = useCallback((goal: any) => {
    console.log('Goal updated:', goal);
    // Here you could save to localStorage or send to analytics
  }, []);

  // Task management callbacks
  const handleTaskStart = useCallback((task: any) => {
    setCurrentTaskId(task.id);
    console.log('Task started:', task);
  }, []);

  const handleTaskEnd = useCallback((task: any, timeSpent: number) => {
    setCurrentTaskId(undefined);
    console.log('Task ended:', task, 'Time spent:', timeSpent);
  }, []);

  // Distraction tracking callbacks
  const handleDistractionDetected = useCallback((type: string, severity: string) => {
    console.log('Distraction detected:', type, severity);
    // Update distraction count
    setDistractionCount(prev => prev + 1);
  }, []);

  // Focus mode callbacks
  const handleModeActivated = useCallback((mode: any) => {
    setCurrentFocusMode(mode.id);
    console.log('Focus mode activated:', mode);
  }, []);

  const handleModeDeactivated = useCallback(() => {
    setCurrentFocusMode(undefined);
    console.log('Focus mode deactivated');
  }, []);

  // Break reminder callbacks
  const handleBreakStart = useCallback(() => {
    console.log('Break started');
    // Could pause focus tracking or show break overlay
  }, []);

  const handleBreakEnd = useCallback(() => {
    console.log('Break ended');
    // Resume focus tracking
  }, []);

  return (
    <div 
      className="min-h-screen relative transition-all duration-500"
      style={{
        background: `
          linear-gradient(45deg, 
            rgba(59, 130, 246, 0.08), 
            rgba(239, 68, 68, 0.08), 
            rgba(59, 130, 246, 0.08)
          ),
          linear-gradient(to bottom, 
            rgba(59, 130, 246, 0.06) 0%, 
            rgba(239, 68, 68, 0.05) 20%, 
            rgba(59, 130, 246, 0.04) 40%, 
            rgba(239, 68, 68, 0.03) 60%, 
            rgba(59, 130, 246, 0.02) 80%, 
            rgba(232, 227, 214, 0.8) 100%
          ),
          ${handInFrame && !cameraPaused ? '#E0DBC8' : '#E8E3D6'}
        `,
        backgroundSize: '200% 200%, 100% 100%, 100% 100%',
        animation: 'gradientShift 8s ease-in-out infinite'
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center">
                <h1 className="text-2xl font-black text-black tracking-tight">
                  FOCUS ZONE
                </h1>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center space-x-8">
                <button 
                  onClick={() => setCurrentAppPage(0)}
                  className={`font-medium transition-colors ${
                    currentAppPage === 0 
                      ? 'text-black' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => setCurrentAppPage(1)}
                  className={`font-medium transition-colors ${
                    currentAppPage === 1 
                      ? 'text-black' 
                      : 'text-gray-600 hover:text-black'
                  }`}
                >
                  Features
                </button>
                <span className="text-gray-600 font-medium">Pricing</span>
                <span className="text-gray-600 font-medium">Download</span>
              </nav>

              {/* Action Buttons */}
              <div className="flex items-center space-x-4">
                <button className="text-gray-600 hover:text-black transition-colors font-medium">
                  Log in
                </button>
                <button 
                  onClick={startSession}
                  className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                >
                  Start Focus
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main App Container with Horizontal Sliding */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentAppPage * 100}%)` }}
        >
          {/* Home Page */}
          <div className="w-full flex-shrink-0">
            <div className="container mx-auto px-6 pt-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Video Feed */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className={`relative bg-black rounded-2xl overflow-hidden shadow-2xl border-2 transition-all duration-500 ${
                handInFrame && !cameraPaused 
                  ? 'border-transparent bg-gradient-to-r from-pink-400 via-blue-400 to-orange-400 p-[2px]' 
                  : 'border-black'
              }`}
            >
              <div className={`w-full h-full rounded-2xl overflow-hidden transition-all duration-500 ${
                handInFrame && !cameraPaused ? 'bg-black' : ''
              }`}>
              {/* Marketing Image - Replace with actual camera feed */}
              <div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-purple-50">
                <img
                  src="/image.png"
                  alt="Focus Zone User - AI-Powered Focus Tracking"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="text-sm font-medium">Focus Zone User</div>
                  <div className="text-xs opacity-80">AI-Powered Focus Tracking</div>
                </div>
              </div>
              
              {/* Hidden camera elements for actual functionality */}
              <video
                ref={videoRef}
                className="hidden"
                playsInline
              />
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className="hidden"
              />
              </div>
              
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80">
                  <div className="text-center text-white p-6">
                    <Eye className="w-16 h-16 mx-auto mb-4 text-red-400" />
                    <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                    <p className="text-gray-300">{cameraError}</p>
                    <button
                      onClick={initializeMediaPipe}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {cameraPaused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-[#E8E3D6]/95 backdrop-blur-sm"
                >
                  <div className="text-center text-black p-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-24 h-24 mx-auto mb-6 bg-black rounded-full flex items-center justify-center"
                    >
                      <Target className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-3xl font-black mb-2 text-black"
                    >
                      Ready to Lock In
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-gray-700 mb-6 text-lg"
                    >
                      Session complete! Start a new focus session when ready.
                    </motion.p>
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      onClick={resumeCamera}
                      className="px-8 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-bold text-lg"
                    >
                      Resume Camera
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Session Paused Overlay */}
              {sessionPaused && !cameraPaused && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-[#E8E3D6]/90 backdrop-blur-sm"
                >
                  <div className="text-center text-black p-8">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-24 h-24 mx-auto mb-6 bg-orange-500 rounded-full flex items-center justify-center"
                    >
                      <Pause className="w-12 h-12 text-white" />
                    </motion.div>
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="text-3xl font-black mb-2 text-black"
                    >
                      Session Paused
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="text-gray-700 mb-6 text-lg"
                    >
                      Your session is currently paused. Resume when ready to continue.
                    </motion.p>
                    <motion.button
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                      onClick={togglePause}
                      className="px-8 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-bold text-lg"
                    >
                      Resume Session
                    </motion.button>
                  </div>
                </motion.div>
              )}
              
              {/* Focus Overlay */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <Eye className={`w-6 h-6 ${isFocused ? 'text-green-400' : 'text-red-400'}`} />
                  <div>
                    <div className="text-white font-bold text-2xl">{focusScore}%</div>
                    <div className="text-sm text-gray-300">
                      {isFocused ? 'Focused' : 'Distracted'}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              {/* Gesture Indicator */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-xl p-4 border border-white/20"
              >
                <div className="flex items-center gap-3">
                  <Hand className="w-6 h-6 text-blue-400" />
                  <div>
                    <div className="text-white font-semibold">
                      {currentGesture.replace('_', ' ')}
                    </div>
                    {currentGesture !== 'NONE' && (
                      <div className="text-xs text-gray-300">
                        Hold: {gestureHoldTime} frames
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Gesture Progress Bar */}
                {currentGesture !== 'NONE' && (
                  <div className="mt-2 w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-400 transition-all duration-100"
                      style={{ 
                        width: `${Math.min(100, (gestureHoldTime / (gestureSettings.gestureSensitivity * 30)) * 100)}%` 
                      }}
                    />
                  </div>
                )}
              </motion.div>
              
              {/* Session Status */}
              <AnimatePresence>
                {sessionActive && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full font-bold flex items-center gap-2 border-2 border-black ${
                      isHoldingPauseGesture 
                        ? 'bg-yellow-500 text-black' 
                        : sessionPaused 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-green-500 text-white'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${
                      isHoldingPauseGesture 
                        ? 'bg-black animate-pulse' 
                        : 'bg-white animate-pulse'
                    }`}></div>
                    {isHoldingPauseGesture 
                      ? 'Holding to Pause' 
                      : sessionPaused 
                        ? 'Session Paused' 
                        : 'Session Active'
                    }
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Gesture Success Indicator */}
              <AnimatePresence>
                {gestureTriggered && lastTriggeredGesture !== 'NONE' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                    className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                  >
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    {lastTriggeredGesture.replace('_', ' ')} Detected!
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Gesture Controls Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 border-black"
            >
              <h3 className="text-black font-bold mb-3">Gesture Controls</h3>
              <div className="grid grid-cols-3 gap-3 text-sm">
                {gestureControls.slice(0, 3).map((control, index) => (
                  <motion.div
                    key={control.gesture}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-3xl mb-1">{control.icon}</div>
                    <div className="text-gray-700 font-medium">{control.action}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          
          {/* Stats Panel */}
          <div className="space-y-4">
            {/* Session Timer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-black"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="w-6 h-6 text-blue-600" />
                <h3 className="text-black font-bold text-lg">Session Time</h3>
              </div>
              <div className="text-5xl font-bold text-black mb-2">
                {formatTime(sessionTime)}
              </div>
              <div className="text-gray-700 text-sm">
                {focusedTime}s focused ({sessionTime > 0 ? ((focusedTime / sessionTime) * 100).toFixed(0) : 0}%)
              </div>
            </motion.div>
            
            {/* Focus Meter */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-black"
            >
              <h3 className="text-black font-bold mb-4">Focus Meter</h3>
              <div className="relative w-full h-4 bg-gray-300 rounded-full overflow-hidden border border-black">
                <motion.div 
                  className={`h-full transition-all duration-300 ${
                    focusScore > 70 ? 'bg-green-500' :
                    focusScore > 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${focusScore}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </motion.div>
            
            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-black"
            >
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h3 className="text-black font-bold text-lg">Statistics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-700">Distractions</span>
                  <span className="text-black font-bold">{distractionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Focus Score</span>
                  <span className="text-black font-bold">{focusScore}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Status</span>
                  <span className={`font-bold ${
                    sessionActive 
                      ? (isHoldingPauseGesture 
                          ? 'text-yellow-600' 
                          : sessionPaused 
                            ? 'text-orange-600' 
                            : 'text-green-600'
                        ) 
                      : 'text-gray-500'
                  }`}>
                    {sessionActive 
                      ? (isHoldingPauseGesture 
                          ? 'Holding to Pause' 
                          : sessionPaused 
                            ? 'Paused' 
                            : 'Active'
                        ) 
                      : 'Inactive'
                    }
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Manual Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-black"
            >
              <h3 className="text-black font-bold mb-4">Manual Controls</h3>
              <div className="space-y-2">
                {!sessionActive ? (
                  <button
                    onClick={startSession}
                    className="w-full flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors border border-black"
                  >
                    <Play className="w-4 h-4" />
                    Start Session
                  </button>
                ) : (
                  <>
                    <button
                      onClick={togglePause}
                      className="w-full flex items-center justify-center gap-2 bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors border border-black"
                    >
                      {sessionPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                      {sessionPaused ? 'Resume' : 'Pause'}
                    </button>
                    <button
                      onClick={endSession}
                      className="w-full flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors border border-black"
                    >
                      <Square className="w-4 h-4" />
                      End Session
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
              </div>
              
              {/* Home Page Widgets */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pomodoro Widget */}
                {showPomodoro && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <PomodoroTimer
                      onSessionStart={handlePomodoroSessionStart}
                      onSessionEnd={handlePomodoroSessionEnd}
                      onBreakStart={handlePomodoroBreakStart}
                      onBreakEnd={handlePomodoroBreakEnd}
                    />
                  </motion.div>
                )}
                
                {/* Ambient Sounds Widget */}
                {showAmbientSounds && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <AmbientSounds />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
          
          {/* Features Page */}
          <div className="w-full flex-shrink-0">
            <div className="container mx-auto px-6 pt-32">
              {/* Feature Kanban Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-light text-black mb-4 tracking-tight">
            Focus Zone Features
          </h2>
          <p className="text-gray-600 text-lg font-light">
            Comprehensive tools for enhanced productivity
          </p>
        </div>
        
        {/* Kanban Board */}
        <div className="relative">
          {/* Navigation Arrows */}
          <button 
            onClick={() => setCurrentFeaturePage(Math.max(0, currentFeaturePage - 1))}
            disabled={currentFeaturePage === 0}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 z-10 w-12 h-12 rounded-full border-2 border-gray-300 bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-black hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button 
            onClick={() => setCurrentFeaturePage(Math.min(2, currentFeaturePage + 1))}
            disabled={currentFeaturePage === 2}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 z-10 w-12 h-12 rounded-full border-2 border-gray-300 bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-black hover:border-gray-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          
          {/* Kanban Cards Container */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentFeaturePage * 100}%)` }}
            >
              {/* Page 1: Core Features */}
              <div className="w-full flex-shrink-0 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 transition-all duration-300 ${
                        showFocusModes 
                          ? 'border-black bg-black' 
                          : 'border-gray-300'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mt-4 transition-all duration-300 ${
                          showFocusModes ? 'bg-white' : 'bg-gray-400'
                        }`} style={{
                          clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
                        }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Focus Modes</h3>
                      <p className="text-gray-600 text-sm mb-4">Customize your focus environment with different modes for various tasks.</p>
                      <button 
                        onClick={() => setShowFocusModes(!showFocusModes)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          showFocusModes 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showFocusModes ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 transition-all duration-300 ${
                        showPomodoro 
                          ? 'border-black bg-black' 
                          : 'border-gray-300'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mt-4 transition-all duration-300 ${
                          showPomodoro ? 'bg-white' : 'bg-gray-400'
                        }`} style={{
                          borderRadius: '50%',
                          border: '2px solid currentColor'
                        }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Pomodoro Timer</h3>
                      <p className="text-gray-600 text-sm mb-4">Work in focused 25-minute intervals with built-in break reminders.</p>
                      <button 
                        onClick={() => setShowPomodoro(!showPomodoro)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          showPomodoro 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showPomodoro ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 transition-all duration-300 ${
                        showTasks 
                          ? 'border-black bg-black' 
                          : 'border-gray-300'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mt-4 transition-all duration-300 ${
                          showTasks ? 'bg-white' : 'bg-gray-400'
                        }`} style={{
                          border: '2px solid currentColor',
                          borderRadius: '2px'
                        }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Task Manager</h3>
                      <p className="text-gray-600 text-sm mb-4">Link focus sessions to specific tasks and track time per project.</p>
                      <button 
                        onClick={() => setShowTasks(!showTasks)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          showTasks 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showTasks ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Page 2: Tracking Features */}
              <div className="w-full flex-shrink-0 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 transition-all duration-300 ${
                        showStreaks 
                          ? 'border-black bg-black' 
                          : 'border-gray-300'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mt-4 transition-all duration-300 ${
                          showStreaks ? 'bg-white' : 'bg-gray-400'
                        }`} style={{
                          background: 'linear-gradient(45deg, transparent 30%, currentColor 30%, currentColor 70%, transparent 70%)'
                        }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Focus Streaks</h3>
                      <p className="text-gray-600 text-sm mb-4">Track consecutive days of focused work and celebrate milestones.</p>
                      <button 
                        onClick={() => setShowStreaks(!showStreaks)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          showStreaks 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showStreaks ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 transition-all duration-300 ${
                        showDistractions 
                          ? 'border-black bg-black' 
                          : 'border-gray-300'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mt-4 transition-all duration-300 ${
                          showDistractions ? 'bg-white' : 'bg-gray-400'
                        }`} style={{
                          border: '2px solid currentColor',
                          borderRadius: '50%',
                          position: 'relative'
                        }}>
                          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-current rounded-full transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Distraction Tracker</h3>
                      <p className="text-gray-600 text-sm mb-4">Categorize and analyze distractions to improve focus habits.</p>
                      <button 
                        onClick={() => setShowDistractions(!showDistractions)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          showDistractions 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showDistractions ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <button 
                        onClick={() => setShowAnalytics(true)}
                        className="w-full text-left"
                      >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-gray-300">
                          <div className="w-8 h-8 mx-auto mt-4 bg-gray-400" style={{
                            background: 'linear-gradient(45deg, transparent 40%, currentColor 40%, currentColor 60%, transparent 60%)'
                          }} />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Analytics Dashboard</h3>
                        <p className="text-gray-600 text-sm mb-4">View detailed insights and trends from your focus sessions.</p>
                        <div className="w-full py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300">
                          View Analytics
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Page 3: Wellness Features */}
              <div className="w-full flex-shrink-0 px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 transition-all duration-300 ${
                        showAmbientSounds 
                          ? 'border-black bg-black' 
                          : 'border-gray-300'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mt-4 transition-all duration-300 ${
                          showAmbientSounds ? 'bg-white' : 'bg-gray-400'
                        }`} style={{
                          background: 'radial-gradient(circle, currentColor 2px, transparent 2px)',
                          backgroundSize: '4px 4px'
                        }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Ambient Sounds</h3>
                      <p className="text-gray-600 text-sm mb-4">Enhance focus with curated background sounds and music.</p>
                      <button 
                        onClick={() => setShowAmbientSounds(!showAmbientSounds)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          showAmbientSounds 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showAmbientSounds ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-4 rounded-full border-2 transition-all duration-300 ${
                        showBreakReminders 
                          ? 'border-black bg-black' 
                          : 'border-gray-300'
                      }`}>
                        <div className={`w-8 h-8 mx-auto mt-4 transition-all duration-300 ${
                          showBreakReminders ? 'bg-white' : 'bg-gray-400'
                        }`} style={{
                          border: '2px solid currentColor',
                          borderRadius: '50%',
                          position: 'relative'
                        }}>
                          <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-current transform -translate-x-1/2" />
                          <div className="absolute top-1/2 left-1/2 w-2 h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Break Reminders</h3>
                      <p className="text-gray-600 text-sm mb-4">Get notified to take breaks and practice eye care exercises.</p>
                      <button 
                        onClick={() => setShowBreakReminders(!showBreakReminders)}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                          showBreakReminders 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {showBreakReminders ? 'Active' : 'Activate'}
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all duration-300">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-gray-300">
                        <div className="w-8 h-8 mx-auto mt-4 bg-gray-400" style={{
                          background: 'linear-gradient(45deg, transparent 30%, currentColor 30%, currentColor 70%, transparent 70%)'
                        }} />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Coming Soon</h3>
                      <p className="text-gray-600 text-sm mb-4">More features are being developed to enhance your focus experience.</p>
                      <div className="w-full py-2 px-4 rounded-lg font-medium bg-gray-100 text-gray-500">
                        In Development
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Page Indicators */}
          <div className="flex justify-center mt-8 space-x-2">
            {[0, 1, 2].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentFeaturePage(page)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentFeaturePage === page 
                    ? 'bg-black' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


      {/* Enhanced Analytics Modal */}
      <EnhancedAnalytics
        sessionHistory={sessionHistory}
        isOpen={showAnalytics}
        onClose={() => setShowAnalytics(false)}
      />


      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute top-16 right-6 w-96 bg-white rounded-2xl p-6 shadow-2xl border-2 border-black"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-black font-bold text-xl mb-4">Gesture Settings</h3>
              <div className="space-y-6">
                {/* Enable Start Gesture */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-black font-semibold">Enable Start Gesture</h4>
                    <p className="text-sm text-gray-600">Allow starting sessions with fist gesture</p>
                  </div>
                  <button
                    onClick={() => setGestureSettings(prev => ({ ...prev, enableStartGesture: !prev.enableStartGesture }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      gestureSettings.enableStartGesture ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      gestureSettings.enableStartGesture ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Pause Toggle Mode */}
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-black font-semibold">Pause Toggle Mode</h4>
                    <p className="text-sm text-gray-600">Toggle pause with gesture vs hold to pause</p>
                  </div>
                  <button
                    onClick={() => setGestureSettings(prev => ({ ...prev, pauseToggle: !prev.pauseToggle }))}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      gestureSettings.pauseToggle ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      gestureSettings.pauseToggle ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {/* Gesture Sensitivity */}
                <div>
                  <h4 className="text-black font-semibold mb-2">Gesture Sensitivity</h4>
                  <p className="text-sm text-gray-600 mb-3">How long to hold gesture before triggering</p>
                  <input
                    type="range"
                    min="0.3"
                    max="1.5"
                    step="0.1"
                    value={gestureSettings.gestureSensitivity}
                    onChange={(e) => setGestureSettings(prev => ({ ...prev, gestureSensitivity: parseFloat(e.target.value) }))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Fast (0.3s)</span>
                    <span>Current: {gestureSettings.gestureSensitivity}s</span>
                    <span>Slow (1.5s)</span>
                  </div>
                </div>

                {/* Debug Info */}
                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-black font-semibold mb-2">Debug Info</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>Current Gesture: <span className="font-mono">{currentGesture}</span></div>
                    <div>Hold Time: <span className="font-mono">{gestureHoldTime} frames</span></div>
                    <div>Triggered: <span className="font-mono">{gestureTriggered ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});


FocusZone.displayName = 'FocusZone';

export default FocusZone;
