import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContextType {
  showToast: (message: string, type?: "success" | "error" | "info") => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });
export const useCustomToast = () => useContext(ToastContext);

export function CustomToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: "success" | "error" | "info" = "success") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-20 right-4 z-[100] flex flex-col gap-2 sm:bottom-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              t.type === "success"
                ? "bg-success text-success-foreground"
                : t.type === "error"
                ? "bg-destructive text-destructive-foreground"
                : "bg-primary text-primary-foreground"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
