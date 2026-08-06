"use client";

import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({ 
  isOpen, 
  title = "Confirm Action", 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = "Confirm", 
  cancelText = "Cancel" 
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border shadow-2xl rounded-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-amber-500">
            <div className="p-2 bg-amber-500/10 rounded-full">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg font-sans text-foreground">{title}</h3>
          </div>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-8">
            {message}
          </p>
          <div className="flex justify-end gap-3 font-sans">
            <button 
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-border bg-background hover:bg-muted font-bold text-sm transition-colors"
            >
              {cancelText}
            </button>
            <button 
              onClick={() => {
                onConfirm();
              }}
              className="px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-sm"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
