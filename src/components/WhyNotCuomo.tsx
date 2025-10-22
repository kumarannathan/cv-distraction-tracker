import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const WhyNotCuomo: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.section
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.8 }}
      id="why-not-cuomo"
      className="bold-card"
    >
      <div className="mb-12">
        <div className="eyebrow">CHAPTER 4</div>
        <h2 className="section-header">
          WHY NOT CUOMO?
        </h2>
      </div>

      <div className="article-content">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="body-text mb-6"
        >
          Andrew Cuomo's 2025 NYC mayoral campaign has been marked by increasingly desperate tactics, including AI-generated attack ads 
          and coordinated smear campaigns targeting his opponents. His campaign has focused heavily on divisive messaging rather than 
          substantive policy proposals.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="callout-box"
        >
          <h3>The AI Ad Controversy</h3>
          <p className="text-white/90 mb-4">
            Cuomo released an AI-generated attack ad featuring a fake "mini-me" version of former Mayor Bill de Blasio, 
            attempting to smear his opponent by association. The ad was widely criticized as desperate and ineffective.
          </p>
          <p className="text-white/90">
            As one commentator noted: "Who is going to watch this and go, 'Hell yeah, brother. I'm voting for Andrew Cuomo'?"
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="body-text mb-6"
        >
          The campaign has also been marked by coordinated smear efforts, including paid advertisements telling voters to 
          "Google Hassan Piker 9/11" in an attempt to weaponize out-of-context statements against his opponents.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="callout-box"
        >
          <h3>The Smear Campaign</h3>
          <p className="text-white/90 italic">
            "They're just so desperate that they're hitting every racist line that they can... 
            It's very strange. I also don't know who Rebecca Kadaga is. And everything I know about Siraj Wahaj is that he's just a prominent Muslim religious leader."
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="body-text mb-6"
        >
          The campaign's tactics have been widely criticized as ineffective and desperate, with search data showing 
          that the smear attempts have failed to gain traction among voters.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.2 }}
          className="mb-8"
        >
          <h3 className="subsection-header mb-4">Campaign Tactics</h3>
          <ul className="space-y-2 text-gray-700 mb-8">
            <li>• AI-generated attack ads targeting opponents</li>
            <li>• Coordinated smear campaigns with billionaire backing</li>
            <li>• Paid advertisements telling voters to "Google Hassan Piker 9/11"</li>
            <li>• Focus on divisive messaging over policy substance</li>
          </ul>
          
          <h3 className="subsection-header mb-4">Campaign Failures</h3>
          <ul className="space-y-2 text-gray-700">
            <li>• Search data shows smear attempts failed to gain traction</li>
            <li>• Desperate tactics widely criticized as ineffective</li>
            <li>• Campaign lacks coherent policy platform</li>
            <li>• Relies on fear-mongering rather than solutions</li>
          </ul>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.4 }}
          className="body-text mb-6"
        >
          The campaign represents a broader pattern of establishment politicians using fear-based messaging and smear tactics 
          <motion.span
            initial={{ scale: 1, fontWeight: 400 }}
            whileInView={{ scale: 1.012, fontWeight: 700 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true }}
            className="inline-block font-bold"
          >
            when faced with popular progressive alternatives, resort to smear campaigns rather than engaging with substantive policy debates.
          </motion.span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.6 }}
          className="callout-box"
        >
          <h3>Broader Implications</h3>
          <p className="text-white/90">
            Cuomo's campaign tactics reflect a larger trend in American politics where establishment candidates, 
            when faced with popular progressive alternatives, resort to desperate smear campaigns rather than 
            engaging with substantive policy debates or addressing real voter concerns.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6, delay: 1.8 }}
          className="body-text"
        >
          The failure of these tactics demonstrates that voters are increasingly rejecting fear-based politics 
          in favor of candidates who offer genuine solutions to real problems.
        </motion.p>
      </div>
    </motion.section>
  );
};

export default WhyNotCuomo;
