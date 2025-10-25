import React, { useRef, useEffect, useState, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';
import { Eye, Hand, Clock, TrendingUp, Play, Pause, Square, Target } from 'lucide-react';
import EnhancedAnalytics from './EnhancedAnalytics';

interface FocusData {
  duration: number;
  focusedTime: number;
  distractions: number;
  focusPercentage: number;
  timestamp: number;
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
  const [smoothedFocusScore, setSmoothedFocusScore] = useState(0);
  const [focusMeterLevel, setFocusMeterLevel] = useState(0);
  const [focusStateBuffer, setFocusStateBuffer] = useState<boolean[]>([]);
  const [showDistractionWarning, setShowDistractionWarning] = useState(false);
  const [currentGesture, setCurrentGesture] = useState('NONE');
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [focusedTime, setFocusedTime] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [lastFocusState, setLastFocusState] = useState(true);
  const [showFocusPercentage, setShowFocusPercentage] = useState(false);
  const lastDistractionTime = useRef<number>(0);
  const [sessionEndTime, setSessionEndTime] = useState<number | null>(null);
  const sessionEndTimeRef = useRef<number | null>(null);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [eyePositions, setEyePositions] = useState<{left: {x: number, y: number}, right: {x: number, y: number}, gaze: {x: number, y: number}} | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapData, setHeatmapData] = useState<number[][]>([]);
  
  // Initialize heatmap data (20x15 grid for laptop screen)
  useEffect(() => {
    const grid = Array(15).fill(null).map(() => Array(20).fill(0));
    setHeatmapData(grid);
  }, []);
  
  // Function to update heatmap based on gaze position
  const updateHeatmap = useCallback((gazeX: number, gazeY: number) => {
    if (!showHeatmap) {
      console.log('🔥 Heatmap not active, skipping update');
      return;
    }
    
    console.log('🔥 Updating heatmap data with gaze:', gazeX, gazeY);
    
    setHeatmapData(prev => {
      const newData = prev.map(row => [...row]);
      
      // Convert gaze position to grid coordinates
      const gridX = Math.floor(gazeX * 20);
      const gridY = Math.floor(gazeY * 15);
      
      console.log('🔥 Grid coordinates:', gridX, gridY);
      
      // Add heat to the gaze position and surrounding area (ULTRA SENSITIVE)
      for (let y = Math.max(0, gridY - 4); y <= Math.min(14, gridY + 4); y++) {
        for (let x = Math.max(0, gridX - 4); x <= Math.min(19, gridX + 4); x++) {
          const distance = Math.sqrt((x - gridX) ** 2 + (y - gridY) ** 2);
          const heat = Math.max(0, 1 - distance / 6) * 0.3; // Increased from 0.1 to 0.3
          newData[y][x] = Math.min(1, newData[y][x] + heat);
        }
      }
      
      console.log('🔥 Heatmap data updated, max heat:', Math.max(...newData.flat()));
      return newData;
    });
  }, [showHeatmap]);
  
  // Function to get focus status text based on score
  const getFocusStatusText = useCallback((score: number) => {
    if (score >= 65) return "Focused";
    if (score >= 50) return "Present";
    return "Away";
  }, []);
  
  // Analytics state
  const [sessionHistory, setSessionHistory] = useState<FocusData[]>([]);
  
  // UI state
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraPaused, setCameraPaused] = useState(false);
  const [handInFrame, setHandInFrame] = useState(false);
  
  // New feature states
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [showFocusModes, setShowFocusModes] = useState(false);
  const [showFocusTools, setShowFocusTools] = useState(false);
  
  // Gesture settings
  const [gestureSettings, setGestureSettings] = useState({
    pauseToggle: true, // true = toggle on gesture, false = hold gesture
    gestureSensitivity: 0.7 // how long to hold gesture before triggering
  });
  
  // Gesture state tracking
  const [gestureHoldTime, setGestureHoldTime] = useState(0);
  const [lastGesture, setLastGesture] = useState('NONE');
  const [gestureTriggered, setGestureTriggered] = useState(false);
  const [lastTriggeredGesture, setLastTriggeredGesture] = useState('NONE');
  const [isHoldingPauseGesture, setIsHoldingPauseGesture] = useState(false);
  const [palmAbsenceTime, setPalmAbsenceTime] = useState(0);
  
  // Swipe detection state
  const [palmMovementHistory, setPalmMovementHistory] = useState<{x: number, y: number, timestamp: number}[]>([]);
  
  // Use refs to get current state values in callbacks
  const sessionActiveRef = useRef(sessionActive);
  const sessionPausedRef = useRef(sessionPaused);
  const startSessionRef = useRef<(() => void) | null>(null);
  
  // Update refs when state changes
  useEffect(() => {
    sessionActiveRef.current = sessionActive;
  }, [sessionActive]);
  
  useEffect(() => {
    sessionPausedRef.current = sessionPaused;
  }, [sessionPaused]);

  // Function to detect swipe gesture
  const detectSwipe = useCallback((landmarks: any) => {
    if (!landmarks || landmarks.length === 0) return false;
    
    // Get the center of the palm (middle finger MCP joint)
    const palmCenter = landmarks[9]; // Middle finger MCP
    const currentTime = Date.now();
    
    // Add current position to history
    setPalmMovementHistory(prev => {
      const newHistory = [...prev, { x: palmCenter.x, y: palmCenter.y, timestamp: currentTime }];
      // Keep only last 10 positions (about 1/3 second at 30fps)
      return newHistory.slice(-10);
    });
    
    // Check if we have enough movement history
    setPalmMovementHistory(current => {
      if (current.length < 5) return current;
      
      const recent = current.slice(-5); // Last 5 positions
      const start = recent[0];
      const end = recent[recent.length - 1];
      
      // Calculate total distance moved
      const deltaX = end.x - start.x;
      const deltaY = end.y - start.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Check if it's a significant horizontal movement (swipe) - more sensitive
      const isHorizontalSwipe = Math.abs(deltaX) > 0.15 && Math.abs(deltaY) < 0.3;
      const isSignificantMovement = distance > 0.15;
      
      // Debug logging
      if (current.length >= 5) {
        console.log('🔄 Swipe check:', {
          deltaX: deltaX.toFixed(3),
          deltaY: deltaY.toFixed(3),
          distance: distance.toFixed(3),
          isHorizontalSwipe,
          isSignificantMovement
        });
      }
      
      if (isHorizontalSwipe && isSignificantMovement) {
        console.log('👋 SWIPE DETECTED! Resuming session');
        setSessionPaused(false);
        setPalmAbsenceTime(0);
        setIsHoldingPauseGesture(false);
        // Clear movement history after detecting swipe
        return [];
      }
      
      return current;
    });
    
    return false;
  }, []);

  // Gesture controls mapping
  const gestureControls = useMemo(() => {
    const controls = [
      { gesture: 'FIST', icon: '✊', action: 'Start Session', color: 'text-green-400' },
      { gesture: 'OPEN_PALM', icon: '✋', action: 'Pause (swipe to resume)', color: 'text-yellow-400' },
      { gesture: 'PEACE', icon: '✌️', action: 'End Session', color: 'text-red-400' }
    ];
    
    return controls;
  }, []);

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

  // Focus meter level effect - slowly grows when focused, drops when distracted
  useEffect(() => {
    if (!sessionActive) return;
    
    const interval = setInterval(() => {
      setFocusMeterLevel(prev => {
        // If paused, maintain current level (don't track)
        if (sessionPaused || isHoldingPauseGesture) {
          return prev;
        }
        
        if (isFocused) {
          // Slowly grow when focused (0.5% per second)
          return Math.min(100, prev + 0.5);
        } else {
          // Drop all the way down when distracted
          return 0;
        }
      });
    }, 100); // Update every 100ms for smooth animation
    
    return () => clearInterval(interval);
  }, [sessionActive, sessionPaused, isFocused, isHoldingPauseGesture]);

  // Initialize MediaPipe
  const initializeMediaPipe = useCallback(async () => {
    try {
      if (!videoRef.current) return;

        // Initialize Face Mesh
        const faceMesh = new FaceMesh({
          locateFile: (file) => {
            if (file.includes('face_detection_short_range.tflite')) {
              return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`;
            }
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
          }
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
    const focus = calculateFocusScore(landmarks, smoothedFocusScore);
    
    // Calculate eye positions and gaze direction for debug overlay
    if ((showDebugOverlay || showHeatmap) && landmarks.length >= 468) {
      const leftEye = landmarks[468];
      const rightEye = landmarks[473];
      const noseTip = landmarks[1];
      
      // Calculate gaze direction (simplified - using nose tip as reference)
      const gazeX = noseTip.x;
      const gazeY = noseTip.y;
      
      setEyePositions({
        left: { x: leftEye.x, y: leftEye.y },
        right: { x: rightEye.x, y: rightEye.y },
        gaze: { x: gazeX, y: gazeY }
      });
      
      // Update heatmap if active
      if (showHeatmap) {
        console.log('🔥 Updating heatmap with gaze:', gazeX, gazeY);
        updateHeatmap(gazeX, gazeY);
      }
    }
    
    // Update smoothed focus score
    setSmoothedFocusScore(focus.smoothedScore);
    
    // Buffer focus states for smoother transitions (faster updates)
    setFocusStateBuffer(prev => {
      const newBuffer = [...prev, focus.focused].slice(-3); // Keep last 3 readings
      const focusedCount = newBuffer.filter(Boolean).length;
      const smoothedFocused = focusedCount >= 2; // Need 2/3 readings to be focused
      
      setIsFocused(smoothedFocused);
      
      // Debug focus state changes
      if (lastFocusState !== smoothedFocused) {
        console.log('📊 FOCUS STATE CHANGE:', { 
          lastFocusState, 
          smoothedFocused, 
          sessionPaused: sessionPausedRef.current,
          isHoldingPauseGesture 
        });
      }
      
        // Count distraction every time you look away, but only once every 5 seconds (and only if session is active)
        if (lastFocusState && !smoothedFocused && sessionActiveRef.current && !sessionPausedRef.current && !isHoldingPauseGesture) {
          const currentTime = Date.now();
          const timeSinceLastDistraction = currentTime - lastDistractionTime.current;
          
          // Only count if it's been at least 5 seconds since the last distraction
          if (timeSinceLastDistraction >= 5000) {
            console.log('📊 LOOKED AWAY - Counting distraction! (5s cooldown passed)');
            setDistractionCount(prev => {
              const newCount = prev + 1;
              console.log('📊 Distraction count updated:', prev, '→', newCount);
              return newCount;
            });
            lastDistractionTime.current = currentTime;
          } else {
            console.log('📊 LOOKED AWAY - Not counting (cooldown active,', Math.round((5000 - timeSinceLastDistraction)/1000), 's remaining)');
          }
          
          setShowDistractionWarning(true);
          // Hide warning after 2 seconds
          setTimeout(() => setShowDistractionWarning(false), 2000);
        }
      setLastFocusState(smoothedFocused);
      
      return newBuffer;
    });
    
    // Use smoothed score for display
    setFocusScore(focus.smoothedScore);
    
    drawCanvas(results.image, landmarks, null);
  }, [lastFocusState, cameraPaused, smoothedFocusScore]);

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
    
    // Debug: Log gesture detection
    if (gesture !== 'NONE' && gesture !== lastGesture) {
      console.log(`🎯 Gesture detected: ${gesture} | Session active: ${sessionActiveRef.current} | Session paused: ${sessionPausedRef.current}`);
    }
    
    // Special handling for FIST gesture - start session immediately when no session is active
    if (gesture === 'FIST' && !sessionActiveRef.current && startSessionRef.current) {
      // Prevent starting session immediately after ending one (5 second cooldown)
      const timeSinceEnd = sessionEndTimeRef.current ? Date.now() - sessionEndTimeRef.current : Infinity;
      console.log('🔍 FIST COOLDOWN CHECK:', { 
        sessionEndTime: sessionEndTimeRef.current, 
        currentTime: Date.now(),
        timeSinceEnd, 
        cooldownActive: timeSinceEnd < 5000,
        cooldownSeconds: Math.round(timeSinceEnd/1000)
      });
      if (timeSinceEnd < 5000) {
        console.log('⏳ FIST DETECTED - Ignoring due to cooldown period (', Math.round(timeSinceEnd/1000), 's ago)');
        return;
      }
      console.log('🚀 FIST DETECTED - Starting session immediately');
      startSessionRef.current();
      return; // Skip the normal gesture hold logic
    }
    
    // Special handling for PEACE gesture - end session immediately when session is active
    if (gesture === 'PEACE' && sessionActiveRef.current) {
      console.log('🚀 PEACE DETECTED - Ending session immediately');
      endSession();
      return; // Skip the normal gesture hold logic
    }
    
    // Handle open palm gesture for immediate pause
    if (gesture === 'OPEN_PALM' as any) {
      console.log('🖐️ OPEN PALM DETECTED - Session active:', sessionActiveRef.current, 'Session paused:', sessionPausedRef.current);
      
      // If session is paused, check for swipe gesture to resume
      if (sessionActiveRef.current && sessionPausedRef.current) {
        console.log('🔄 Checking for swipe gesture to resume...');
        detectSwipe(landmarks);
        return; // Don't process pause logic if we're already paused
      }
      
      if (sessionActiveRef.current) {
        console.log('🖐️ OPEN PALM DETECTED - Pausing session');
        // Immediately pause if not already paused
        if (!sessionPausedRef.current) {
          setSessionPaused(true);
          console.log('⏸️ Session paused by open palm');
        }
        // Reset palm absence counter
        setPalmAbsenceTime(0);
        setIsHoldingPauseGesture(true);
      } else {
        console.log('⚠️ Open palm detected but no active session - use fist to start');
      }
    } else if (gesture !== 'OPEN_PALM' as any && sessionActiveRef.current && sessionPausedRef.current) {
      // Palm is not detected, increment absence time
      setPalmAbsenceTime(prev => {
        const newTime = prev + 1;
        if (newTime % 30 === 0) { // Log every second
          console.log(`⏱️ Palm absence time: ${newTime} frames (${Math.round(newTime/30)}s)`);
        }
        return newTime;
      });
      setIsHoldingPauseGesture(false);
      
      // Resume after 6 seconds (180 frames at 30fps)
      if (palmAbsenceTime >= 180) {
        console.log('▶️ Resuming session after 6 seconds without palm');
        setSessionPaused(false);
        setPalmAbsenceTime(0);
      }
    } else if (gesture !== 'OPEN_PALM' as any) {
      setIsHoldingPauseGesture(false);
      // Reset counter if session not active or not paused
      if (!sessionActiveRef.current || !sessionPausedRef.current) {
        setPalmAbsenceTime(0);
      }
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
  }, [cameraPaused, lastGesture, gestureHoldTime, gestureTriggered, gestureSettings.gestureSensitivity, sessionActive, sessionPaused, palmAbsenceTime, detectSwipe]);

  // Session management functions
  const startSession = useCallback(() => {
    console.log('🚀 STARTING SESSION - Setting sessionActive to true');
    setSessionActive(true);
    setSessionPaused(false);
    setCameraPaused(false);
    setSessionTime(0);
    setFocusedTime(0);
    setDistractionCount(0);
    lastDistractionTime.current = 0;
    console.log('✅ Session start function completed');
  }, []);
  
  // Update startSession ref
  useEffect(() => {
    startSessionRef.current = startSession;
  }, [startSession]);

  const resumeCamera = useCallback(() => {
    setCameraPaused(false);
  }, []);

  const togglePause = useCallback(() => {
    console.log('🔄 TOGGLE PAUSE FUNCTION CALLED - Current state:', sessionPaused);
    setSessionPaused(prev => {
      const newState = !prev;
      console.log('✅ PAUSE STATE CHANGED FROM', prev, 'TO', newState);
      
      // If resuming from pause, set focus meter to 100%
      if (prev && !newState) {
        console.log('🎯 Resuming from pause - setting focus meter to 100%');
        setFocusMeterLevel(100);
      }
      
      return newState;
    });
  }, [sessionPaused]);


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
    
    // Reset all session data
    console.log('🔄 Resetting session data...');
    setSessionActive(false);
    setSessionPaused(false);
    setSessionTime(0);
    setFocusedTime(0);
    setDistractionCount(0);
    setIsHoldingPauseGesture(false);
    const endTime = Date.now();
    setSessionEndTime(endTime);
    sessionEndTimeRef.current = endTime;
    console.log('⏰ SESSION END TIME SET:', endTime);
    
    // Pause camera with overlay
    console.log('📷 Pausing camera with overlay...');
    setCameraPaused(true);
    
    // Resume camera after 3 seconds
    setTimeout(() => {
      console.log('📷 Resuming camera...');
      setCameraPaused(false);
    }, 3000);
  }, [sessionTime, focusedTime, distractionCount]);

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
        if (!sessionActive) {
          console.log('✅ Starting session with fist gesture');
          startSession();
        } else {
          console.log('❌ Fist gesture ignored - session already active');
        }
        break;
      case 'OPEN_PALM':
        // Now handled directly in onHandResults for immediate response
        console.log('⚠️ Open palm pause is now handled in real-time detection');
        break;
      case 'PEACE':
        if (sessionActive) {
          console.log('✅ Ending session with peace gesture');
          endSession();
        } else {
          console.log('❌ Peace gesture ignored - no active session');
        }
        break;
      default:
        console.log('❓ Unknown gesture:', gesture);
    }
  }, [sessionActive, sessionPaused, gestureSettings, startSession, togglePause, endSession]);

  // Focus score calculation with smoothing
  const calculateFocusScore = useCallback((landmarks: any[], currentSmoothedScore: number) => {
    if (!landmarks || landmarks.length < 468) {
      return { focused: false, score: 0, smoothedScore: 0 };
    }

    const leftEye = landmarks[468];
    const rightEye = landmarks[473];
    const noseTip = landmarks[1];
    const chin = landmarks[152];
    
    // Calculate head pose angles with more lenient thresholds
    const eyeDistance = Math.abs(leftEye.x - rightEye.x);
    const centered = Math.abs(noseTip.x - 0.5) < 0.2; // More lenient centering
    const lookingForward = Math.abs(noseTip.y - chin.y) > 0.08; // More lenient forward looking
    
    // More gradual focus detection
    const focusStrength = (centered ? 0.4 : 0) + (eyeDistance > 0.1 ? 0.3 : 0) + (lookingForward ? 0.3 : 0);
    const focused = focusStrength > 0.7; // Need 70% of criteria to be focused
    
    // Smoother score calculation with less random variation
    const baseScore = focused ? 95 : 25;
    const variation = focused ? Math.random() * 5 : Math.random() * 15;
    const rawScore = baseScore + variation;
    
    // Apply smoothing to reduce rapid changes (faster updates)
    const smoothingFactor = 0.6; // Higher = faster updates
    const smoothedScore = Math.round(currentSmoothedScore * (1 - smoothingFactor) + rawScore * smoothingFactor);
    
    return { 
      focused, 
      score: Math.round(rawScore),
      smoothedScore,
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
    const handleClickOutside = () => {
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

      {/* Main App Container */}
      <div className="relative">
        {/* Main Page */}
        <div className="container mx-auto px-6 pt-8">
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
                    {/* Camera Feed */}
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover scale-x-[-1]"
                      playsInline
                      autoPlay
                      muted
                    />
                    <canvas
                      ref={canvasRef}
                      width={1280}
                      height={720}
                      className="absolute inset-0 w-full h-full"
                    />
                    
                    {/* Debug Toggle Button - Bottom Right */}
                    <button
                      onClick={() => {
                        setShowFocusPercentage(!showFocusPercentage);
                        setShowDebugOverlay(!showDebugOverlay);
                      }}
                      className={`absolute bottom-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        showDebugOverlay 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={showDebugOverlay ? 'Hide Debug Overlay' : 'Show Debug Overlay'}
                    >
                      &lt;/&gt;
                    </button>
                    
                    {/* Heatmap Toggle Button - Bottom Right (next to debug) */}
                    <button
                      onClick={() => {
                        console.log('🔥 Heatmap toggle clicked, current state:', showHeatmap);
                        setShowHeatmap(!showHeatmap);
                      }}
                      className={`absolute bottom-4 right-14 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        showHeatmap 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                      title={showHeatmap ? 'Hide Heatmap' : 'Show Heatmap'}
                    >
                      🔥
                    </button>
                    
                    {/* Debug Overlay - Grid and Eye Tracking Lines */}
                    {showDebugOverlay && (
                      <div className="absolute inset-0 pointer-events-none">
                        {/* Grid Overlay */}
                        <div className="absolute inset-0 opacity-20">
                          {/* Vertical lines */}
                          {Array.from({ length: 16 }, (_, i) => (
                            <div
                              key={`v-${i}`}
                              className="absolute top-0 bottom-0 w-px bg-cyan-400"
                              style={{ left: `${(i + 1) * 6.25}%` }}
                            />
                          ))}
                          {/* Horizontal lines */}
                          {Array.from({ length: 12 }, (_, i) => (
                            <div
                              key={`h-${i}`}
                              className="absolute left-0 right-0 h-px bg-cyan-400"
                              style={{ top: `${(i + 1) * 8.33}%` }}
                            />
                          ))}
                        </div>
                        
                        {/* Dynamic Eye Tracking Lines */}
                        <div className="absolute inset-0">
                          {eyePositions && (
                            <>
                              {/* Left eye tracking line */}
                              <div 
                                className="absolute w-px h-20 bg-red-400 opacity-60" 
                                style={{ 
                                  left: `${eyePositions.left.x * 100}%`, 
                                  top: `${eyePositions.left.y * 100}%`,
                                  transform: 'translateY(-50%)'
                                }} 
                              />
                              {/* Right eye tracking line */}
                              <div 
                                className="absolute w-px h-20 bg-red-400 opacity-60" 
                                style={{ 
                                  left: `${eyePositions.right.x * 100}%`, 
                                  top: `${eyePositions.right.y * 100}%`,
                                  transform: 'translateY(-50%)'
                                }} 
                              />
                              {/* Gaze direction lines from eyes */}
                              <div 
                                className="absolute w-16 h-px bg-green-400 opacity-70" 
                                style={{ 
                                  left: `${eyePositions.left.x * 100}%`, 
                                  top: `${eyePositions.left.y * 100}%`,
                                  transform: `translate(${eyePositions.gaze.x > eyePositions.left.x ? '0' : '-100%'}, -50%)`
                                }} 
                              />
                              <div 
                                className="absolute w-16 h-px bg-green-400 opacity-70" 
                                style={{ 
                                  left: `${eyePositions.right.x * 100}%`, 
                                  top: `${eyePositions.right.y * 100}%`,
                                  transform: `translate(${eyePositions.gaze.x > eyePositions.right.x ? '0' : '-100%'}, -50%)`
                                }} 
                              />
                              {/* Gaze target indicator */}
                              <div 
                                className="absolute w-3 h-3 bg-yellow-400 rounded-full opacity-80" 
                                style={{ 
                                  left: `${eyePositions.gaze.x * 100}%`, 
                                  top: `${eyePositions.gaze.y * 100}%`,
                                  transform: 'translate(-50%, -50%)'
                                }} 
                              />
                              {/* Eye Labels */}
                              <div 
                                className="absolute bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
                                style={{ 
                                  left: `${eyePositions.left.x * 100}%`, 
                                  top: `${eyePositions.left.y * 100}%`,
                                  transform: 'translate(-50%, -100%)'
                                }} 
                              >
                                EYES
                              </div>
                              <div 
                                className="absolute bg-red-500 text-white text-xs font-bold px-2 py-1 rounded"
                                style={{ 
                                  left: `${eyePositions.right.x * 100}%`, 
                                  top: `${eyePositions.right.y * 100}%`,
                                  transform: 'translate(-50%, -100%)'
                                }} 
                              >
                                EYES
                              </div>
                            </>
                          )}
                          {/* Crosshair at center */}
                          <div className="absolute w-6 h-px bg-yellow-400 opacity-80" style={{ left: '50%', top: '50%', transform: 'translateX(-50%)' }} />
                          <div className="absolute w-px h-6 bg-yellow-400 opacity-80" style={{ left: '50%', top: '50%', transform: 'translateY(-50%)' }} />
                        </div>
                        
                        {/* Debug Info Overlay - Bottom Left */}
                        <div className="absolute bottom-4 left-4 bg-black/80 text-white p-2 rounded text-xs font-mono">
                          <div>DEBUG MODE</div>
                          <div>Grid: 16x12</div>
                          <div>Eye Tracking: Active</div>
                        </div>
                      </div>
                    )}
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
                    <div className="text-white font-bold text-2xl">
                      {sessionPaused || isHoldingPauseGesture 
                        ? 'Paused' 
                        : (showFocusPercentage ? `${focusScore}%` : getFocusStatusText(focusScore))
                      }
                    </div>
                    <div className="text-sm text-gray-300">
                      {sessionPaused || isHoldingPauseGesture 
                        ? 'Session Paused' 
                        : (isFocused ? 'Focused' : 'Distracted')
                      }
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
                      ? 'Paused by Palm' 
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
            
            {/* Heatmap Display - Underneath Camera */}
            {showHeatmap && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
                className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6 border-2 border-black"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-black font-bold text-lg">Laptop Screen Heatmap</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Add test heat data
                        setHeatmapData(prev => {
                          const newData = prev.map(row => [...row]);
                          // Add heat to center area
                          for (let y = 6; y <= 8; y++) {
                            for (let x = 8; x <= 12; x++) {
                              newData[y][x] = Math.min(1, newData[y][x] + 0.5);
                            }
                          }
                          return newData;
                        });
                      }}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                    >
                      Test Heat
                    </button>
                    <div className="text-sm text-gray-600">
                      Gaze tracking visualization
                    </div>
                  </div>
                </div>
                
                {/* Heatmap Grid */}
                <div className="relative bg-gray-900 rounded-lg p-4 overflow-hidden">
                  <div className="grid grid-cols-20 gap-0 w-full h-64">
                    {heatmapData.map((row, y) =>
                      row.map((heat, x) => (
                        <div
                          key={`${x}-${y}`}
                          className="aspect-square border border-gray-700"
                          style={{
                            backgroundColor: `rgba(255, ${Math.floor(255 * (1 - heat))}, 0, ${Math.max(0.1, heat)})`
                          }}
                        />
                      ))
                    )}
                  </div>
                  
                  {/* Heatmap Legend */}
                  <div className="absolute top-2 right-2 bg-black/80 text-white p-2 rounded text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-red-500"></div>
                      <span>High</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 bg-yellow-500"></div>
                      <span>Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500"></div>
                      <span>Low</span>
                    </div>
                  </div>
                </div>
                
                {/* Heatmap Stats */}
                <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-gray-600">Total Gaze Points</div>
                    <div className="text-black font-bold">
                      {heatmapData.flat().filter(h => h > 0).length}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Max Heat</div>
                    <div className="text-black font-bold">
                      {Math.max(...heatmapData.flat()).toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-600">Avg Heat</div>
                    <div className="text-black font-bold">
                      {(heatmapData.flat().reduce((a, b) => a + b, 0) / heatmapData.flat().length).toFixed(2)}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
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
                    focusMeterLevel > 70 ? 'bg-green-500' :
                    focusMeterLevel > 40 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${focusMeterLevel}%` }}
                  transition={{ duration: 0.1 }}
                />
              </div>
            </motion.div>
            
            {/* Distraction Warning */}
            <AnimatePresence>
              {showDistractionWarning && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-red-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg border border-red-400"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="font-semibold text-sm">⚠️ Distraction Noted</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
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
                  <span className="text-black font-bold">
                    {sessionPaused || isHoldingPauseGesture 
                      ? 'Paused' 
                      : (showFocusPercentage ? `${focusScore}%` : getFocusStatusText(focusScore))
                    }
                  </span>
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
                          ? 'Paused by Palm' 
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
              
            </div>
        </div>
        
        {/* Focus Tools Dropdown Section */}
        <div className="container mx-auto px-6 py-8">
          {/* Dropdown Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <button
              onClick={() => setShowFocusTools(!showFocusTools)}
              className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <h2 className="text-3xl font-bold text-black mb-2 group-hover:text-gray-700 transition-colors">
                    Focus Tools
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Essential productivity tools designed to enhance your focus and workflow
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: showFocusTools ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <svg 
                    className="w-6 h-6 text-gray-600 group-hover:text-black transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </motion.div>
              </div>
            </button>
          </motion.div>
          
          {/* Collapsible Content */}
          <AnimatePresence>
            {showFocusTools && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="max-w-4xl mx-auto overflow-hidden"
              >
                <div className="pt-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Focus Modes Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className={`relative group transition-all duration-500 ${
                  showFocusModes 
                    ? 'transform scale-105' 
                    : 'hover:transform hover:scale-102'
                }`}
              >
                <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
                  showFocusModes 
                    ? 'bg-gradient-to-br from-black via-gray-900 to-black text-white shadow-2xl' 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                }`}>
                  
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 opacity-5 transition-opacity duration-500 ${
                    showFocusModes ? 'opacity-10' : 'opacity-5'
                  }`}>
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Cpolygon points='30,0 60,30 30,60 0,30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '60px 60px'
                    }} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      showFocusModes 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-gray-100'
                    }`}>
                      <div className={`w-10 h-10 transition-all duration-500 ${
                        showFocusModes ? 'text-white' : 'text-gray-600'
                      }`} style={{
                        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
                        background: 'currentColor'
                      }} />
                    </div>
                    
                    {/* Title */}
                    <h3 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${
                      showFocusModes ? 'text-white' : 'text-gray-800'
                    }`}>
                      Focus Modes
                    </h3>
                    
                    {/* Description */}
                    <p className={`text-lg mb-8 leading-relaxed transition-colors duration-500 ${
                      showFocusModes ? 'text-gray-200' : 'text-gray-600'
                    }`}>
                      Customize your focus environment with specialized modes for different tasks and workflows.
                    </p>
                    
                    {/* Features List */}
                    <div className={`space-y-3 mb-8 transition-colors duration-500 ${
                      showFocusModes ? 'text-gray-200' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-500 ${
                          showFocusModes ? 'bg-white' : 'bg-gray-400'
                        }`} />
                        Deep Work Mode
                      </div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-500 ${
                          showFocusModes ? 'bg-white' : 'bg-gray-400'
                        }`} />
                        Creative Flow Mode
                      </div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-500 ${
                          showFocusModes ? 'bg-white' : 'bg-gray-400'
                        }`} />
                        Study Session Mode
                      </div>
                    </div>
                    
                    {/* Button */}
                    <button 
                      onClick={() => setShowFocusModes(!showFocusModes)}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-500 ${
                        showFocusModes 
                          ? 'bg-white text-black hover:bg-gray-100' 
                          : 'bg-black text-white hover:bg-gray-800'
                      }`}
                    >
                      {showFocusModes ? '✓ Active' : 'Activate Focus Modes'}
                    </button>
                  </div>
                  
                  {/* Glow Effect */}
                  {showFocusModes && (
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 animate-pulse" />
                  )}
                </div>
              </motion.div>
              
              {/* Pomodoro Timer Card */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`relative group transition-all duration-500 ${
                  showPomodoro 
                    ? 'transform scale-105' 
                    : 'hover:transform hover:scale-102'
                }`}
              >
                <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 ${
                  showPomodoro 
                    ? 'bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 text-white shadow-2xl' 
                    : 'bg-white border-2 border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl'
                }`}>
                  
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 opacity-5 transition-opacity duration-500 ${
                    showPomodoro ? 'opacity-10' : 'opacity-5'
                  }`}>
                    <div className="absolute inset-0" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '40px 40px'
                    }} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                      showPomodoro 
                        ? 'bg-white/20 backdrop-blur-sm' 
                        : 'bg-gray-100'
                    }`}>
                      <div className={`w-10 h-10 rounded-full border-4 transition-all duration-500 ${
                        showPomodoro ? 'border-white' : 'border-gray-600'
                      }`} />
                    </div>
                    
                    {/* Title */}
                    <h3 className={`text-2xl font-bold mb-4 transition-colors duration-500 ${
                      showPomodoro ? 'text-white' : 'text-gray-800'
                    }`}>
                      Pomodoro Timer
                    </h3>
                    
                    {/* Description */}
                    <p className={`text-lg mb-8 leading-relaxed transition-colors duration-500 ${
                      showPomodoro ? 'text-gray-200' : 'text-gray-600'
                    }`}>
                      Work in focused 25-minute intervals with built-in break reminders and productivity tracking.
                    </p>
                    
                    {/* Features List */}
                    <div className={`space-y-3 mb-8 transition-colors duration-500 ${
                      showPomodoro ? 'text-gray-200' : 'text-gray-600'
                    }`}>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-500 ${
                          showPomodoro ? 'bg-white' : 'bg-gray-400'
                        }`} />
                        25-minute work sessions
                      </div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-500 ${
                          showPomodoro ? 'bg-white' : 'bg-gray-400'
                        }`} />
                        5-minute short breaks
                      </div>
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 transition-colors duration-500 ${
                          showPomodoro ? 'bg-white' : 'bg-gray-400'
                        }`} />
                        15-minute long breaks
                      </div>
                    </div>
                    
                    {/* Button */}
                    <button 
                      onClick={() => setShowPomodoro(!showPomodoro)}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-500 ${
                        showPomodoro 
                          ? 'bg-white text-orange-600 hover:bg-gray-100' 
                          : 'bg-orange-500 text-white hover:bg-orange-600'
                      }`}
                    >
                      {showPomodoro ? '✓ Active' : 'Activate Pomodoro'}
                    </button>
                  </div>
                  
                  {/* Glow Effect */}
                  {showPomodoro && (
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-500/20 via-red-500/20 to-pink-500/20 animate-pulse" />
                  )}
                </div>
              </motion.div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
