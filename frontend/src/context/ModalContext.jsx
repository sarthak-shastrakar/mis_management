import React, { createContext, useContext, useState, useCallback } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'confirm', // 'confirm' or 'alert'
    title: '',
    message: '',
    confirmText: 'Yes, Proceed',
    cancelText: 'Cancel',
    onConfirm: () => {},
    onCancel: () => {},
    variant: 'danger', // 'danger', 'info', 'success', 'warning'
  });

  const showConfirm = useCallback(({ title, message, onConfirm, onCancel, confirmText, cancelText, variant = 'danger' }) => {
    setModalState({
      isOpen: true,
      type: 'confirm',
      title,
      message,
      onConfirm: () => {
        onConfirm?.();
        setModalState(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => {
        onCancel?.();
        setModalState(prev => ({ ...prev, isOpen: false }));
      },
      confirmText: confirmText || 'Yes, Proceed',
      cancelText: cancelText || 'Cancel',
      variant,
    });
  }, []);

  const showAlert = useCallback(({ title, message, onOk, confirmText, variant = 'info' }) => {
    setModalState({
      isOpen: true,
      type: 'alert',
      title,
      message,
      onConfirm: () => {
        onOk?.();
        setModalState(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setModalState(prev => ({ ...prev, isOpen: false })),
      confirmText: confirmText || 'Understood',
      variant,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <ModalContext.Provider value={{ showConfirm, showAlert, closeModal, modalState }}>
      {children}
    </ModalContext.Provider>
  );
};
