import React, { useState, memo, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = useMemo(() => [
    { id: 'who-is-hasan', title: 'WHO IS HASAN?', subtitle: 'Background & Context' },
    { id: 'america-deserved', title: 'AMERICA DESERVED?', subtitle: 'The Controversial Statement' },
    { id: 'cuomo-context', title: 'CUOMO CONTEXT', subtitle: 'The Interview' },
    { id: 'mamdani-stance', title: 'MAMDANI STANCE', subtitle: 'Academic Perspective' },
    { id: 'why-not-cuomo', title: 'WHY NOT CUOMO', subtitle: 'Political Analysis' },
    { id: 'resources', title: 'RESOURCES', subtitle: 'Further Reading' }
  ], []);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  }, []);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#E8E3D6] border-b-2 border-black"
      >
        <div className="max-w-7xl mx-auto pl-2 pr-6 py-2">
          <div className="flex items-center justify-between">
            {/* NYC Mayoral Text with Circle - Left */}
            <div className="flex items-center space-x-4">
              <img 
                src="/circle.png" 
                alt="Circle" 
                className="h-12 w-auto"
                loading="eager"
              />
              <div>
                <h1 className="text-xl font-black text-black tracking-tight">
                  2025 NYC MAYORAL ELECTION
                </h1>
                <p className="text-xs text-gray-700 uppercase tracking-[0.2em] font-medium">
                  EDUCATIONAL RESOURCE
                </p>
              </div>
            </div>

            {/* Hamburger Menu Button */}
            <button
              onClick={toggleMenu}
              className="relative w-12 h-12 bg-black rounded-lg flex items-center justify-center group"
              aria-label="Toggle menu"
            >
              <motion.div
                className="w-6 h-0.5 bg-white"
                animate={{
                  rotate: isMenuOpen ? 45 : 0,
                  y: isMenuOpen ? 0 : -4
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="absolute w-6 h-0.5 bg-white"
                animate={{
                  opacity: isMenuOpen ? 0 : 1
                }}
                transition={{ duration: 0.3 }}
              />
              <motion.div
                className="w-6 h-0.5 bg-white"
                animate={{
                  rotate: isMenuOpen ? -45 : 0,
                  y: isMenuOpen ? 0 : 4
                }}
                transition={{ duration: 0.3 }}
              />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="absolute top-16 right-6 w-80 bg-white rounded-2xl p-6 shadow-2xl border-2 border-black"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full text-left p-4 bg-[#E8E3D6] rounded-xl border-2 border-black hover:bg-black hover:text-white transition-all duration-300 group"
                  >
                    <h3 className="font-black text-sm tracking-tight mb-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-600 group-hover:text-gray-300">
                      {item.subtitle}
                    </p>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});

Header.displayName = 'Header';

export default Header;
