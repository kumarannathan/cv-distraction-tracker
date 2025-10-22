import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const CuomoAd: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      id="cuomo-ad"
      className="py-16 border-t border-gray-200"
    >
      <div className="mb-12">
        <div className="eyebrow small-caps">You May Have Seen This Lately</div>
        <h2 className="text-4xl font-serif font-bold text-black mb-8"
            style={{ 
              letterSpacing: '-0.01em',
              fontFeatureSettings: '"kern" 1, "liga" 1, "dlig" 1'
            }}>
          Cuomo's Propaganda Campaign
        </h2>
      </div>

      <div className="article-content">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg text-gray-800 leading-relaxed mb-8"
          style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
        >
          As part of his mayoral campaign, Andrew Cuomo has been running attack ads that specifically target 
          progressive candidates by associating them with controversial statements taken out of context. 
          This is the propaganda poster that's been circulating.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="callout mb-8"
        >
          <div className="eyebrow">The Ad in Question</div>
          <div className="mt-4">
            <img 
              src="/ad.png" 
              alt="Cuomo campaign propaganda poster targeting Hasan Piker and 9/11 controversy"
              className="w-full max-w-2xl mx-auto rounded-sm shadow-sm border border-gray-200"
            />
            <p className="text-sm text-gray-600 mt-2 text-center italic">
              Cuomo campaign ad telling voters to "Google Hasan Piker 9/11"
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid md:grid-cols-2 gap-8 my-12"
        >
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-semibold text-black">
              What This Ad Does
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Takes statements out of context</li>
              <li>• Creates guilt-by-association attacks</li>
              <li>• Uses emotional triggers (9/11)</li>
              <li>• Misleads voters about candidates' positions</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-serif font-semibold text-black">
              Why It's Problematic
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Reduces complex issues to soundbites</li>
              <li>• Undermines informed political discourse</li>
              <li>• Exploits voters' emotions and fears</li>
              <li>• Distracts from actual policy differences</li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="pull-quote"
        >
          "This type of propaganda relies on voters not understanding the context behind 
          controversial statements and instead reacting emotionally to the mention of 9/11."
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="text-lg text-gray-800 leading-relaxed mb-6"
          style={{ fontFeatureSettings: '"kern" 1, "liga" 1' }}
        >
          This is exactly why educational resources like this website are so important. 
          When political campaigns use misleading tactics, voters need access to factual 
          information and proper context to make informed decisions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="callout"
        >
          <div className="eyebrow">The Real Story</div>
          <p className="text-gray-800">
            Instead of falling for Cuomo's propaganda, take the time to understand the full context 
            of the statements he's attacking. Read the sections above to learn about Hasan Piker, 
            the actual meaning behind controversial statements, and the political motivations 
            driving these attacks.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default CuomoAd;
