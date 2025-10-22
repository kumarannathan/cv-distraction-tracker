import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FloatingIndicator: React.FC = () => {
  const [currentSection, setCurrentSection] = useState('Manifesto');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const sections = [
        { id: 'hero', name: 'Manifesto' },
        { id: 'cuomo-ad', name: 'Cuomo Ad' },
        { id: 'who-is-hasan', name: 'Section I' },
        { id: 'america-deserved', name: 'Section II' },
        { id: 'cuomo-context', name: 'Section III' },
        { id: 'mamdani-stance', name: 'Section IV' },
        { id: 'why-not-cuomo', name: 'Section V' },
        { id: 'resources', name: 'Section VI' },
      ];

      const scrollPosition = window.scrollY + 100;
      
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          const elementBottom = elementTop + rect.height;
          
          if (scrollPosition >= elementTop && scrollPosition < elementBottom) {
            setCurrentSection(section.name);
            setIsVisible(true);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : 20 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-8 right-8 z-40"
    >
      <div className="bg-white border-2 border-black px-4 py-3 rounded-xl shadow-lg" style={{ backgroundColor: '#fefefe' }}>
        <div className="text-sm font-black text-black tracking-tight small-caps">
          {currentSection}
        </div>
        <div className="text-xs text-gray-700 uppercase tracking-[0.2em] font-medium mt-1">
          {new Date().toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingIndicator;
