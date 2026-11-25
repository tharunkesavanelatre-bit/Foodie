"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import Toast, { ToastType } from "./Toast";

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => void;
};

type ToastData = {
  id: number;
  message: string;
  type: ToastType;
};

const ToastContext = createContext<ToastContextType | undefined>(
  undefined
);

export function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toast, setToast] = useState<ToastData | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  const showToast = useCallback(
    (message: string, type: ToastType = "success") => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      const id = Date.now();

      setToast({
        id,
        message,
        type,
      });

      timerRef.current = setTimeout(() => {
        setToast((current) =>
          current?.id === id ? null : current
        );
      }, 4000);
    },
    []
  );

  const closeToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    setToast(null);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {toast && (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
}