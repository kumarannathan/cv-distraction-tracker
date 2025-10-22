import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const WhoIsHasan: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      id="who-is-hasan"
      className="bold-card"
    >
      <div className="mb-12">
        <div className="eyebrow small-caps">CHAPTER 1</div>
        <h2 className="section-header">
          WHO IS HASAN PIKER?
        </h2>
      </div>

      <div className="article-content">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="body-text mb-6"
        >
          Hasan Piker is a Turkish-American political commentator and streamer who hosts 
          "The Breakdown" on Twitch and appears regularly on The Young Turks (TYT) network. 
          He's known for his progressive political commentary and has built a significant 
          following among young, left-leaning audiences.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="callout-box-blue"
        >
          <h3>Background</h3>
          <ul className="space-y-2 text-white/90">
            <li>• Born in Turkey, moved to the US as a child</li>
            <li>• Nephew of Cenk Uygur, founder of The Young Turks</li>
            <li>• Graduated from Rutgers University with a degree in political science</li>
            <li>• Hosts one of the most popular political streams on Twitch</li>
            <li>• Known for progressive takes on foreign policy and domestic issues</li>
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="body-text mb-6"
        >
          Piker has been a vocal critic of US foreign policy, particularly regarding 
          military interventions in the Middle East. His commentary often focuses on 
          the human cost of American foreign policy decisions and critiques what he 
          sees as imperialist tendencies in US government actions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="callout-box-blue"
        >
          <h3>Key Quote</h3>
          <p className="text-white/90 italic">
            "Hasan Piker represents a new generation of political commentators who 
            use streaming platforms to reach young audiences with progressive 
            political content."
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="body-text"
        >
          His platform has made him a target for conservative critics who disagree 
          with his political views, particularly his critiques of US foreign policy 
          and his support for progressive causes.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default WhoIsHasan;
