'use client';

import { Dialog } from '@repo/ui/dialog';
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface DialogContextType {
  isOpen: boolean;
  open: (
    dialogGenerator: ({
      isOpen,
      close,
    }: {
      isOpen: boolean;
      close: () => void;
    }) => ReactNode
  ) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }

  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<ReactNode>(null);

  const value = {
    isOpen,
    open: (
      dialogGenerator: ({
        isOpen,
        close,
      }: {
        isOpen: boolean;
        close: () => void;
      }) => ReactNode
    ) => {
      const close = () => {
        setIsOpen(false);
      };
      const content = dialogGenerator({ isOpen, close });
      setDialogContent(content);
      setIsOpen(true);
    },
  };

  return (
    <DialogContext.Provider value={value}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        {dialogContent}
      </Dialog>
      {children}
    </DialogContext.Provider>
  );
};
