'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  type = 'danger',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 z-[9999] animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-card-border rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/5 text-muted hover:text-foreground transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="p-6 text-center space-y-4">
          {/* Icon with Ring Animation */}
          <div className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center ${
            type === 'danger' 
              ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
              : 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
          }`}>
            <AlertTriangle size={26} className="animate-pulse" />
          </div>

          {/* Texts */}
          <div>
            <h3 className="text-lg font-bold text-foreground">{title}</h3>
            <p className="text-sm text-muted mt-2 px-2 leading-relaxed">{message}</p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-white/5 text-foreground transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all transform hover:scale-[1.02] active:scale-95 cursor-pointer ${
                type === 'danger'
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/15'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/15'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
