import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const ResourcesSection: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isExpanded, setIsExpanded] = useState(false);

  const resources = [
    {
      title: "Support Zohran Kwame Mamdani",
      description: "Learn about Zohran's campaign and how to help",
      link: "https://zohranmamdani.com",
      type: "Campaign"
    },
    {
      title: "Join Democratic Socialists of America",
      description: "Get involved with progressive organizing",
      link: "https://www.dsausa.org",
      type: "Organization"
    },
    {
      title: "Read Mahmood Mamdani's Work",
      description: "Academic analysis of US foreign policy",
      link: "https://www.goodreads.com/author/show/123456.Mahmood_Mamdani",
      type: "Education"
    },
    {
      title: "Follow Hasan Piker on Twitch",
      description: "Watch his political commentary and analysis",
      link: "https://www.twitch.tv/hasanabi",
      type: "Media"
    },
    {
      title: "Learn About US Foreign Policy",
      description: "Educational resources on American interventionism",
      link: "https://www.cfr.org",
      type: "Education"
    }
  ];

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      id="resources"
      className="bg-white border-2 border-black rounded-xl p-8"
    >
      {/* Dropdown Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="eyebrow small-caps">SECTION VI</div>
            <h2 className="section-header">
              WHERE CAN I LEARN MORE?
            </h2>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="ml-4"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </motion.div>
        </div>
      </motion.button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden"
          >
            <div className="article-content mt-8">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="body-text mb-8"
              >
                If you're interested in learning more about these issues or getting involved 
                in progressive politics, here are some resources to help you get started.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-6"
              >
                {resources.map((resource, index) => (
                  <motion.a
                    key={index}
                    href={resource.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                    className="block p-6 bg-white border-2 border-black rounded-xl hover:bg-black hover:text-white transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-black text-lg text-black mb-2 group-hover:text-white">
                          {resource.title}
                        </h3>
                        <p className="text-gray-700 text-sm mb-2 group-hover:text-gray-300">
                          {resource.description}
                        </p>
                        <span className="text-xs text-gray-500 uppercase tracking-wider group-hover:text-gray-400">
                          {resource.type}
                        </span>
                      </div>
                      <div className="ml-4 text-gray-400 group-hover:text-white">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="mt-12 p-6 bg-white border-2 border-black rounded-xl"
              >
                <h3 className="font-black text-lg text-black mb-4">Get Involved</h3>
                <p className="text-gray-700 mb-4">
                  The best way to counter misleading political attacks is to stay informed 
                  and get involved in the political process. Whether you support progressive 
                  candidates or just want to understand the issues better, these resources 
                  can help you make informed decisions.
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li>• Research candidates' actual positions, not just attack ads</li>
                  <li>• Get involved in local politics and organizing</li>
                  <li>• Support candidates who align with your values</li>
                  <li>• Stay informed about the issues that matter to you</li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.0 }}
                className="mt-12 pt-8 border-t-2 border-black"
              >
                <div className="text-center">
                  <p className="body-text text-sm">
                    This educational resource was created to provide context about Hasan Piker, 
                    the 9/11 controversy, and the political context surrounding Cuomo's campaign ad.
                  </p>
                  <p className="text-xs text-gray-700 uppercase tracking-[0.2em] font-medium mt-2">
                    Last updated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
};

export default ResourcesSection;
