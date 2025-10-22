import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const AmericaDeserved: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      id="america-deserved"
      className="bold-card"
    >
      <div className="mb-12">
        <div className="eyebrow">CHAPTER 2</div>
        <h2 className="section-header">
          WHY WOULD SOMEONE SAY "AMERICA DESERVED 9/11"?
        </h2>
      </div>

      <div className="article-content">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="body-text mb-6"
        >
          This controversial statement, when made by political commentators, is typically 
          not meant literally but rather as a critique of US foreign policy and its 
          consequences. The context is crucial for understanding what such statements 
          actually mean.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="callout-box-blue"
        >
          <h3>Historical Context</h3>
          <p className="text-white/90 mb-4">
            The statement often references the concept of "blowback" - the idea that 
            US foreign policy actions can have unintended consequences that affect 
            American citizens.
          </p>
          <ul className="space-y-2 text-white/90">
            <li>• US support for authoritarian regimes in the Middle East</li>
            <li>• Military interventions and their civilian casualties</li>
            <li>• Economic policies that have destabilized regions</li>
            <li>• Support for groups that later became threats to the US</li>
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="body-text mb-6"
        >
          When commentators make such statements, they're typically arguing that 
          US foreign policy decisions created conditions that made terrorist attacks 
          more likely, not that the victims of 9/11 deserved to die. This is a 
          distinction that's often lost in political attacks.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="callout-box-blue"
        >
          <h3>Key Insight</h3>
          <p className="text-white/90 italic">
            "The phrase 'America deserved 9/11' is typically used to critique US 
            foreign policy, not to celebrate the deaths of innocent people. It's 
            about understanding cause and effect in international relations."
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
              WHAT CRITICS MEAN
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• US policies created conditions for terrorism</li>
              <li>• Military interventions had unintended consequences</li>
              <li>• Support for repressive regimes backfired</li>
              <li>• Economic policies destabilized regions</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h3 className="subsection-header">
              WHAT IT DOESN'T MEAN
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>• The victims deserved to die</li>
              <li>• The attacks were justified</li>
              <li>• Terrorism is acceptable</li>
              <li>• Individual Americans are to blame</li>
            </ul>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="body-text"
        >
          Understanding this distinction is crucial for having informed political 
          discussions about US foreign policy and its consequences.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default AmericaDeserved;
