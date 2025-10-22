import React, { useState, useEffect, memo, useCallback, useMemo } from 'react';
import { useRef } from 'react';

const HeroSection: React.FC = memo(() => {
  const sectionRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentFascistIndex, setCurrentFascistIndex] = useState(0);
  const [currentEstablishmentIndex, setCurrentEstablishmentIndex] = useState(0);
  
  const fascistTerms = useMemo(() => ['fascist', 'GOP', 'right wing', 'far right', 'extremists', 'ruling class'], []);
  const establishmentTerms = useMemo(() => ['establishment', 'GOP', 'right wing', 'far right', 'extremists', 'ruling class'], []);
  
  useEffect(() => {
    const fascistInterval = setInterval(() => {
      setCurrentFascistIndex((prev) => (prev + 1) % fascistTerms.length);
    }, 3500); // Slower rotation
    
    const establishmentInterval = setInterval(() => {
      setCurrentEstablishmentIndex((prev) => (prev + 1) % establishmentTerms.length);
    }, 4000); // Slower rotation
    
    return () => {
      clearInterval(fascistInterval);
      clearInterval(establishmentInterval);
    };
  }, [fascistTerms.length, establishmentTerms.length]);

  // Scroll hijacking logic with throttling
  const handleScroll = useCallback(() => {
    if (!sectionRef.current) return;
    
    const section = sectionRef.current;
    const rect = section.getBoundingClientRect();
    const sectionHeight = section.offsetHeight;
    const windowHeight = window.innerHeight;
    
    // Calculate progress through this section
    const scrollableHeight = sectionHeight - windowHeight;
    const scrolled = Math.max(0, -rect.top);
    
    const newProgress = Math.min(scrolled / scrollableHeight, 1);
    setScrollProgress(newProgress);
  }, []);

  useEffect(() => {
    let ticking = false;
    
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    handleScroll(); // Initial check
    
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [handleScroll]);

  const paragraphs = useMemo(() => [
    {
      text: "Remember that the frontier of the Rebellion is everywhere. And even the smallest act of insurrection pushes our lines forward.",
      redactions: [
        { original: "Rebellion", replacement: "truth" },
        { original: "insurrection", replacement: "education" }
      ]
    },
    {
      text: "And remember this: the Imperial need for control is so desperate because it is so unnatural. Tyranny requires constant effort. It breaks, it leaks. Authority is brittle.",
      redactions: [
        { original: "Imperial", replacement: fascistTerms[currentFascistIndex] },
        { original: "Authority", replacement: "Censorship" }
      ]
    },
    {
      text: "Oppression is the mask of fear. Remember that. And know this, the day will come when all these skirmishes and battles, these moments of defiance will have flooded the banks of the Empire's authority and then there will be one too many.",
      redactions: [
        { original: "skirmishes and battles", replacement: "debates and discussions" },
        { original: "Empire's", replacement: establishmentTerms[currentEstablishmentIndex] + "'s" }
      ]
    },
    {
      text: "One single thing will break the siege. Remember this.",
      redactions: [
        { original: "siege", replacement: "suppression" }
      ]
    }
  ], [fascistTerms, currentFascistIndex, establishmentTerms, currentEstablishmentIndex]);

  const RotatingText: React.FC<{ terms: string[], currentIndex: number, suffix?: string }> = ({ terms, currentIndex, suffix = '' }) => {
    return (
      <span className="rotating-text-container">
        <span className="rotating-text-wheel" style={{ transform: `translateY(-${currentIndex * 100}%)` }}>
          {terms.map((term, index) => {
            let className = "rotating-text-item";
            if (index === currentIndex) {
              className += " entering";
            } else if (index === (currentIndex - 1 + terms.length) % terms.length) {
              className += " exiting";
            }
            
            return (
              <span key={index} className={className}>
                {term}{suffix}
              </span>
            );
          })}
        </span>
      </span>
    );
  };

  const ScrollRevealWord: React.FC<{ children: React.ReactNode, wordIndex: number, totalWords: number, isInitialText?: boolean, initialOpacity?: number }> = ({ children, wordIndex, totalWords, isInitialText = false, initialOpacity = 1 }) => {
    const visibleWords = Math.floor(scrollProgress * totalWords);
    let opacity;
    
    if (isInitialText) {
      // First few words start with gradient opacity and darken as you scroll
      const baseOpacity = initialOpacity;
      const scrollDarkening = Math.min(scrollProgress * 2, 1); // Darken faster than other words
      opacity = baseOpacity + (1 - baseOpacity) * scrollDarkening;
    } else {
      // Rest of the words fade in based on scroll progress
      opacity = wordIndex < visibleWords ? 1 : 0;
    }

    return (
      <span
        style={{ opacity, transition: 'opacity 0.3s ease-in-out' }}
        className="inline-block mr-1"
      >
        {children}
      </span>
    );
  };

  // Calculate total words across all paragraphs for consistent timing
  const getAllWords = () => {
    let allWords: string[] = [];
    paragraphs.forEach(paragraph => {
      allWords = allWords.concat(paragraph.text.split(/(\s+)/));
    });
    return allWords;
  };

  const totalWords = getAllWords().length;

  const renderTextWithRedactions = (text: string, redactions: Array<{original: string, replacement: string}>, paragraphIndex: number) => {
    const words = text.split(/(\s+)/);
    let wordIndex = 0;
    
    // Calculate starting word index for this paragraph
    for (let i = 0; i < paragraphIndex; i++) {
      wordIndex += paragraphs[i].text.split(/(\s+)/).length;
    }

    // Define the initial visible words (first 3 words of the first paragraph)
    const initialWords = paragraphIndex === 0 ? 3 : 0;
    // Define initial opacity for each word (Remember=0.8, that=0.5, the=0.3)
    const initialOpacities = [0.8, 0.5, 0.3];

    return words.map((word, index) => {
      const isInitialText = paragraphIndex === 0 && index < initialWords;
      const initialOpacity = isInitialText ? initialOpacities[index] : 1;
      
      // Check if this word needs redaction
      let needsRedaction = false;
      let redactionData = null;
      
      redactions.forEach(({ original, replacement }) => {
        const regex = new RegExp(`\\b${original}\\b`, 'gi');
        if (regex.test(word)) {
          needsRedaction = true;
          redactionData = { original, replacement };
        }
      });

      if (needsRedaction && redactionData) {
        const { original, replacement } = redactionData;
        return (
          <ScrollRevealWord key={index} wordIndex={wordIndex++} totalWords={totalWords} isInitialText={isInitialText} initialOpacity={initialOpacity}>
            <span className="inline-block">
              <span className="marker-redacted">{original}</span>
              {replacement === 'ROTATING_FASCIST' ? (
                <RotatingText terms={fascistTerms} currentIndex={currentFascistIndex} />
              ) : replacement === 'ROTATING_ESTABLISHMENT' ? (
                <RotatingText terms={establishmentTerms} currentIndex={currentEstablishmentIndex} suffix="'s" />
              ) : (
                <span className="marker-replacement">{replacement}</span>
              )}
            </span>
          </ScrollRevealWord>
        );
      }
      
      return (
        <ScrollRevealWord key={index} wordIndex={wordIndex++} totalWords={totalWords} isInitialText={isInitialText} initialOpacity={initialOpacity}>
          {word}
        </ScrollRevealWord>
      );
    });
  };

  return (
    <section 
      ref={sectionRef}
      className="relative"
      style={{ 
        height: '300vh',
        backgroundColor: `rgba(232, 227, 214, ${1 - scrollProgress * 0.8})`
      }} // Darken cream background as text renders
    >
      <div className="sticky top-0 h-screen flex items-center justify-center -mt-16">
        <div className="max-w-4xl mx-auto px-6">
          {/* Logo */}
          <div className="flex justify-center mb-4 -mt-8">
            <img 
              src="/logo.png" 
              alt="Humans of New York" 
              className="h-52 w-auto object-cover object-center"
              style={{ objectPosition: 'center 20%' }}
            />
          </div>
          
          {/* Quote paragraphs - single horizontal line */}
          <div className="text-xl md:text-2xl lg:text-3xl leading-relaxed font-serif">
            {paragraphs.map((paragraph, index) => (
              <span key={index}>
                {renderTextWithRedactions(paragraph.text, paragraph.redactions, index)}
                {index < paragraphs.length - 1 && <span className="mx-2"> </span>}
              </span>
            ))}
          </div>
          
          {/* Attribution - only show after full quote is rendered */}
          <div 
            className="text-center mt-8"
            style={{ 
              opacity: scrollProgress >= 0.95 ? 1 : 0,
              transition: 'opacity 0.5s ease-in-out'
            }}
          >
            <p className="text-sm text-gray-600 italic">
              Adapted from Karis Nemik, Andor
            </p>
          </div>

        </div>
      </div>
    </section>
  );
});

HeroSection.displayName = 'HeroSection';

export default HeroSection;
