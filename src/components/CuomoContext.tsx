import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const CuomoContext: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      id="cuomo-context"
      className="bold-card"
    >
      <div className="mb-12">
        <div className="eyebrow small-caps">SECTION 3</div>
        <h2 className="section-header">
          WHY IS THIS BEING BROUGHT UP BY CUOMO?
        </h2>
      </div>

      <div className="article-content">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="body-text mb-6"
        >
          Chris Cuomo's campaign ad featuring the "Google Hasan Piker 9/11" line is 
          part of a broader political strategy to attack progressive candidates by 
          associating them with controversial statements taken out of context.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="callout-box"
        >
          <h3>Political Context</h3>
          <p className="text-white/90 mb-4">
            This attack is happening in the context of a competitive Democratic primary 
            where Cuomo is trying to distinguish himself from progressive challengers.
          </p>
          <ul className="space-y-2 text-white/90">
            <li>• Cuomo is running against progressive challengers</li>
            <li>• Hasan Piker has endorsed progressive candidates</li>
            <li>• The ad attempts to guilt-by-association tactics</li>
            <li>• It's designed to appeal to more conservative Democratic voters</li>
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="body-text mb-6"
        >
          The strategy relies on voters not understanding the context behind Hasan Piker's 
          statements and instead reacting emotionally to the mention of 9/11. This is 
          a common political tactic: take a controversial statement out of context and 
          use it to attack political opponents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="callout-box"
        >
          <h3>Key Insight</h3>
          <p className="text-white/90 italic">
            "Political campaigns often use out-of-context quotes to create guilt-by-association 
            attacks. The goal is to make voters associate progressive candidates with 
            controversial statements they didn't make."
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="grid md:grid-cols-2 gap-8 my-12"
        >
          <div className="space-y-4">
            <h3 className="subsection-header">
              WHY THIS STRATEGY WORKS
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• 9/11 is an emotional trigger for many Americans</li>
              <li>• Most voters won't research the full context</li>
              <li>• Creates negative associations with opponents</li>
              <li>• Appeals to voters' fears and emotions</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="subsection-header">
              WHY IT'S PROBLEMATIC
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Takes statements out of context</li>
              <li>• Misleads voters about candidates' positions</li>
              <li>• Reduces complex issues to soundbites</li>
              <li>• Undermines informed political discourse</li>
            </ul>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="body-text"
        >
          Understanding the political motivations behind this attack helps voters make 
          more informed decisions and see through manipulative campaign tactics.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default CuomoContext;
