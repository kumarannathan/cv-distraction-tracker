import React, { Suspense, lazy } from 'react';
import Header from './components/Header';
import ProgressBar from './components/ProgressBar';
import FloatingIndicator from './components/FloatingIndicator';
import HeroSection from './components/HeroSection';

// Lazy load components for better performance
const WhoIsHasan = lazy(() => import('./components/WhoIsHasan'));
const AmericaDeserved = lazy(() => import('./components/AmericaDeserved'));
const CuomoContext = lazy(() => import('./components/CuomoContext'));
const MamdaniStance = lazy(() => import('./components/MamdaniStance'));
const WhyNotCuomo = lazy(() => import('./components/WhyNotCuomo'));
const PhotoCarousels = lazy(() => import('./components/PhotoCarousel'));
const ResourcesSection = lazy(() => import('./components/ResourcesSection'));

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
      <ProgressBar />
      <FloatingIndicator />
      <Header />
      
      {/* Hero Section - Keep as is */}
      <main>
        <div id="hero">
          <HeroSection />
        </div>
        
        {/* Photo Carousels - Right below Hero Section */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Suspense fallback={<LoadingSpinner />}>
            <PhotoCarousels />
          </Suspense>
        </div>
        
        {/* Content Sections */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-16">
              <div id="who-is-hasan">
                <Suspense fallback={<LoadingSpinner />}>
                  <WhoIsHasan />
                </Suspense>
              </div>
              <div id="america-deserved">
                <Suspense fallback={<LoadingSpinner />}>
                  <AmericaDeserved />
                </Suspense>
              </div>
              <div id="cuomo-context">
                <Suspense fallback={<LoadingSpinner />}>
                  <CuomoContext />
                </Suspense>
              </div>
            </div>
            <div className="lg:col-span-1 space-y-16">
              <div id="mamdani-stance">
                <Suspense fallback={<LoadingSpinner />}>
                  <MamdaniStance />
                </Suspense>
              </div>
              <div id="why-not-cuomo">
                <Suspense fallback={<LoadingSpinner />}>
                  <WhyNotCuomo />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Section */}
        <div id="resources" className="bg-white border-2 border-black py-16 mx-[2%] mb-[2%] rounded-[5px] scale-90">
          <div className="max-w-7xl mx-auto px-6">
            <Suspense fallback={<LoadingSpinner />}>
              <ResourcesSection />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;