'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Spiderman.css';

interface SpidermanNotificationProps {
  show: boolean;
  onWebThrow: () => void;
}

export default function SpidermanNotification({ show, onWebThrow }: SpidermanNotificationProps) {
  const [isThrowing, setIsThrowing] = useState(false);

  const handleClick = () => {
    setIsThrowing(true);
    // Visual web throw animation logic here
    setTimeout(() => {
        onWebThrow();
        setIsThrowing(false);
    }, 1000);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -300 }}
          animate={{ y: 0 }}
          exit={{ y: -300 }}
          transition={{ type: 'spring', damping: 15 }}
          className="fixed top-0 left-20 z-[60] cursor-pointer"
          onClick={handleClick}
        >
          {/* TechByElijah Spiderman Loader */}
          <div className="container center relative scale-50 origin-top">
            <div className="rope center">
              <div className="legs center">
                <div className="boot-l"></div>
                <div className="boot-r"></div>
              </div>
              <div className="costume center">
                <div className="spider">
                  <div className="s1 center"></div>
                  <div className="s2 center"></div>
                  <div className="s3"></div>
                  <div className="s4"></div>
                </div>
                <div className="belt center"></div>
                <div className="hand-r"></div>
                <div className="hand-l"></div>
                <div className="neck center"></div>
                <div className="mask center">
                  <div className="eye-l"></div>
                  <div className="eye-r"></div>
                </div>
                <div className="cover center"></div>
              </div>
            </div>
            
            {/* Real-time Web Throw Visual */}
            {isThrowing && (
                <motion.div 
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 400, opacity: 1 }}
                    className="absolute top-[200px] left-[50%] h-[2px] bg-white border border-slate-200 origin-left"
                    style={{ transform: 'rotate(25deg)' }}
                />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
