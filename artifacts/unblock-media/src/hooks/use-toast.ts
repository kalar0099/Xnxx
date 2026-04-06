import { useState, useEffect } from "react";

// Simplified toast hook for notifications
type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

let toastCounter = 0;
const listeners = new Set<Function>();
let toasts: (ToastProps & { id: string })[] = [];

export const toast = (props: ToastProps) => {
  const id = `toast-${toastCounter++}`;
  toasts = [...toasts, { ...props, id }];
  listeners.forEach((listener) => listener([...toasts]));
  
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    listeners.forEach((listener) => listener([...toasts]));
  }, 3000);
};

export function useToast() {
  const [currentToasts, setCurrentToasts] = useState(toasts);

  useEffect(() => {
    setCurrentToasts(toasts);
    const listener = (newToasts: any) => setCurrentToasts(newToasts);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { toasts: currentToasts, toast };
}
