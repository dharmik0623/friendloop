'use client';

import React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';

interface ComicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export const ComicModal: React.FC<ComicModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="relative bg-yellow-400 border-4 border-black p-8 rounded-xl shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4 transform transition-all animate-in zoom-in-95 duration-200"
        style={{ fontFamily: 'Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif' }}
      >
        {/* Comic "POW" Background Decorative Element */}
        <div className="absolute -top-6 -left-6 bg-red-600 text-white px-4 py-2 border-2 border-black rotate-[-15deg] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-2xl uppercase tracking-wider select-none">
          {type === 'danger' ? 'Wait!' : 'Hey!'}
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:scale-110 transition-transform"
        >
          <X className="w-6 h-6 stroke-[3px]" />
        </button>

        <div className="mt-4">
          <h2 className="text-3xl uppercase italic tracking-tight text-black mb-4">
            {title}
          </h2>
          <p className="text-xl text-black font-sans font-bold leading-tight">
            {message}
          </p>
        </div>

        <div className="mt-8 flex gap-4">
          <Button 
            onClick={onConfirm}
            className={`flex-1 h-12 text-xl uppercase italic border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all
              ${type === 'danger' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            {confirmText}
          </Button>
          <Button 
            onClick={onClose}
            variant="ghost"
            className="flex-1 h-12 text-xl uppercase italic border-2 border-black bg-white text-black hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            {cancelText}
          </Button>
        </div>
        
        {/* Comic halftone dots decoration */}
        <div className="absolute bottom-2 right-2 opacity-10 pointer-events-none">
          <div className="grid grid-cols-4 gap-1">
            {[...Array(16)].map((_, i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-black" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
