import { Suspense } from 'react';
import FocusZone from './components/FocusZone';

// Loading component for Suspense fallback
const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-16">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
  </div>
);

function App() {
  return (
    <div 
      className="min-h-screen relative"
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
          #E8E3D6
        `,
        backgroundSize: '200% 200%, 100% 100%, 100% 100%',
        animation: 'gradientShift 8s ease-in-out infinite'
      }}
    >
      {/* Main Focus Zone Application */}
      <Suspense fallback={<LoadingSpinner />}>
        <FocusZone />
      </Suspense>
    </div>
  );
}

export default App;