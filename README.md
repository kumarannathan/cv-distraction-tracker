# Focus Zone - AI-Powered Focus Tracker

A gesture-controlled focus tracking application that uses computer vision to monitor your attention and productivity in real-time. Built with React, TypeScript, and MediaPipe for advanced eye tracking and gesture recognition.

## Features

### 🎯 Real-Time Focus Tracking
- **Eye Gaze Detection**: Uses MediaPipe Face Mesh to track where you're looking
- **Focus Score**: Real-time 0-100% focus score based on eye position and head pose
- **Distraction Alerts**: Automatically counts when you look away from the screen

### ✋ Gesture Controls
- **✊ Fist**: Start a focus session
- **✋ Open Palm**: Pause/Resume session
- **✌️ Peace Sign**: End session
- **👍 Thumbs Up**: Mark productive moment
- **👎 Thumbs Down**: Mark break time

### 📊 Analytics Dashboard
- **Session Timer**: Track total session time and focused time
- **Focus Meter**: Visual progress bar showing current focus level
- **Statistics**: Distraction count, focus percentage, session status
- **History**: View past sessions and focus analytics

### 🎨 Design Features
- **Preserved Design**: Maintains the original editorial design aesthetic
- **Smooth Animations**: Framer Motion animations for all interactions
- **Responsive Layout**: Works on desktop and mobile devices
- **Real-time Visual Feedback**: Live camera feed with focus indicators

## Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Computer Vision**: MediaPipe Face Mesh + MediaPipe Hands
- **Animations**: Framer Motion
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts (for future analytics)

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Allow Camera Access**
   - The app will request camera permissions
   - Position yourself in front of the camera
   - Make sure you have good lighting

4. **Start Focusing**
   - Use gesture controls or manual buttons to start a session
   - Keep your eyes on the screen to maintain focus
   - View real-time analytics in the sidebar

## How It Works

### Focus Detection Algorithm
1. **Face Detection**: MediaPipe detects your face and extracts 468 facial landmarks
2. **Eye Tracking**: Monitors eye position (landmarks 468, 473) relative to screen center
3. **Head Pose**: Calculates head orientation to detect if you're looking away
4. **Focus Score**: Combines eye position, head pose, and face presence for 0-100% score

### Gesture Recognition
1. **Hand Detection**: MediaPipe Hands detects hand landmarks (21 points per hand)
2. **Finger Counting**: Analyzes which fingers are extended
3. **Gesture Classification**: Maps finger patterns to control actions
4. **Action Execution**: Triggers session controls based on detected gestures

## Browser Compatibility

- **Chrome/Edge**: Full support with MediaPipe
- **Firefox**: Limited support (may need fallback)
- **Safari**: Basic support
- **Mobile**: Works on modern mobile browsers

## Privacy & Security

- **Local Processing**: All computer vision processing happens in your browser
- **No Data Upload**: No video or personal data is sent to external servers
- **Local Storage**: Session data stored locally in browser
- **Camera Access**: Only used for real-time processing, not recorded

## Project Structure

```
src/
├── components/
│   └── FocusZone.tsx        # Main focus tracking component
├── App.tsx                  # Application entry point
├── index.css               # Global styles and animations
└── main.tsx                # Application bootstrap
```

## Design Philosophy

- **Typography-first**: Large serif headlines, clean sans-serif body text
- **Breathing room**: Generous whitespace, restrained layout
- **Editorial styling**: Clean, professional interface design
- **Neutral palette**: Blacks, grays, minimal color for serious tone
- **Smooth motion**: Framer Motion animations for all interactions

## Future Enhancements

- [ ] Pomodoro timer integration
- [ ] Focus music integration
- [ ] Detailed analytics charts
- [ ] Focus streaks and achievements
- [ ] Export session data
- [ ] Multi-user support
- [ ] Custom gesture training

## Development

Built with modern React patterns:
- **Hooks**: useState, useEffect, useCallback, useMemo
- **Performance**: Lazy loading, memoization, optimized re-renders
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile-first approach

## License

MIT License - Feel free to use and modify for your own projects.