'use client';

import './ComicTrashCan.css';
import { motion } from 'framer-motion';

interface ComicTrashCanProps {
  status: 'pow' | 'bam' | 'zap';
  show: boolean;
}

export default function ComicTrashCan({ status, show }: ComicTrashCanProps) {
  if (!show) return null;

  return (
    <motion.div 
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 200, opacity: 0 }}
      className="comic-trash-container fixed bottom-10 left-0 right-0 z-[100]"
    >
      <div className="comic-radio-group">
        <input 
            type="radio" 
            name="comic" 
            id="comic-pow" 
            checked={status === 'pow'} 
            readOnly 
        />
        <label htmlFor="comic-pow">POW!</label>

        <input 
            type="radio" 
            name="comic" 
            id="comic-bam" 
            checked={status === 'bam'} 
            readOnly 
        />
        <label htmlFor="comic-bam">BAM!</label>

        <input 
            type="radio" 
            name="comic" 
            id="comic-zap" 
            checked={status === 'zap'} 
            readOnly 
        />
        <label htmlFor="comic-zap">ZAP!</label>

        <div className="comic-glider"></div>
      </div>
    </motion.div>
  );
}
