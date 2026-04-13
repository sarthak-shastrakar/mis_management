import React from 'react';
import { useModal } from '../context/ModalContext';

const UniversalModal = () => {
  const { modalState, closeModal } = useModal();
  const { isOpen, type, title, message, confirmText, cancelText, onConfirm, onCancel, variant } = modalState;

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-100',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30',
      icon: '🗑️'
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-100',
      button: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30',
      icon: '⚠️'
    },
    success: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-100',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30',
      icon: '✅'
    },
    info: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-600',
      border: 'border-indigo-100',
      button: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30',
      icon: '💡'
    }
  };

  const style = variantStyles[variant] || variantStyles.info;

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
      onClick={(e) => e.target === e.currentTarget && closeModal()}
    >
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 border border-white">
        {/* Header/Icon */}
        <div className={`p-10 flex flex-col items-center text-center ${style.bg} border-b ${style.border}`}>
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center text-4xl shadow-xl mb-6 animate-bounce-subtle">
            {style.icon}
          </div>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h3>
          <p className="mt-4 text-sm font-bold text-slate-500 leading-relaxed px-4">
            {message}
          </p>
        </div>

        {/* Actions */}
        <div className="p-8 flex gap-4 bg-white">
          {type === 'confirm' && (
            <button
              onClick={onCancel}
              className="flex-1 h-14 rounded-2xl bg-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95"
            >
              {cancelText}
            </button>
          )}
          <button
            onClick={onConfirm}
            className={`flex-[1.5] h-14 rounded-2xl text-white font-black text-[10px] uppercase tracking-widest shadow-2xl transition-all active:scale-95 ${style.button}`}
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-subtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-subtle {
          animation: bounce-subtle 3s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default UniversalModal;
