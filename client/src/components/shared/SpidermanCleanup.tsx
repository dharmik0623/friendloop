'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Spiderman.css';

interface SpidermanCleanupProps {
  show: boolean;
  onImpact: () => void;
  onComplete: () => void;
}

export default function SpidermanCleanup({ show, onImpact, onComplete }: SpidermanCleanupProps) {
  const [phase, setPhase] = useState<'idle' | 'grabbing' | 'spinning' | 'throwing'>('idle');

  useEffect(() => {
    if (show) {
      setPhase('idle');
      const timeline = async () => {
        // 1. Drop down (handled by motion.div initial/animate)
        await new Promise(r => setTimeout(r, 800));
        
        // 2. Grab with web
        setPhase('grabbing');
        await new Promise(r => setTimeout(r, 600));

        // 3. High speed spin (TASM2 Rhino style)
        setPhase('spinning');
        await new Promise(r => setTimeout(r, 1500));

        // 4. Throw
        setPhase('throwing');
        await new Promise(r => setTimeout(r, 400));
        
        // 5. Impact (Trigger BAM/POW)
        onImpact();
        await new Promise(r => setTimeout(r, 1000));
        
        // 6. Complete (Reset UI)
        onComplete();
      };
      timeline();
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[110] pointer-events-none">
          {/* Spiderman Body */}
          <motion.div
            initial={{ y: -500 }}
            animate={{ y: 0 }}
            exit={{ y: -500 }}
            transition={{ type: 'spring', damping: 12 }}
            className="absolute top-0 left-1/2 -translate-x-1/2"
          >
            <div className={`container center scale-75 origin-top ${phase === 'spinning' ? 'animate-spiderman-spin' : ''}`}>
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
            </div>

            {/* Web Line during grabbing/spinning */}
            {(phase === 'grabbing' || phase === 'spinning') && (
               <motion.div 
                 initial={{ height: 0 }}
                 animate={{ height: phase === 'spinning' ? 300 : 200 }}
                 className="absolute top-[280px] left-1/2 w-[2px] bg-white border border-slate-100 origin-top shadow-[0_0_10px_white]"
                 style={{ 
                    transform: phase === 'spinning' ? 'translateX(-50%)' : 'translateX(-50%) rotate(0deg)' 
                 }}
               />
            )}
          </motion.div>

          {/* Captured "Chat Bucket" Animation */}
          <AnimatePresence>
            {(phase === 'grabbing' || phase === 'spinning' || phase === 'throwing') && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={
                        phase === 'grabbing' ? { scale: 1, opacity: 1, y: 300 } :
                        phase === 'spinning' ? { 
                            rotate: [0, 360, 720, 1080], 
                            scale: [1, 1.2, 0.8, 1],
                            y: [300, 280, 320, 300],
                            opacity: 1 
                        } :
                        { 
                            y: 800, 
                            x: [0, 50, -50, 0],
                            scale: 0, 
                            opacity: 0,
                            rotate: 720
                        }
                    }
                    transition={
                        phase === 'spinning' ? { duration: 1.5, repeat: Infinity, ease: "linear" } : 
                        { duration: 0.5, ease: "anticipate" }
                    }
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-white/20 backdrop-blur-sm border-4 border-dashed border-white rounded-3xl flex items-center justify-center shadow-2xl"
                >
                    <div className="text-4xl">🗨️</div>
                    {/* Floating messages effect inside bucket */}
                    <motion.div className="absolute inset-0" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                        <div className="absolute top-2 left-2 text-xl">📜</div>
                        <div className="absolute bottom-2 right-2 text-xl">✍️</div>
                    </motion.div>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </AnimatePresence>
  );
}
