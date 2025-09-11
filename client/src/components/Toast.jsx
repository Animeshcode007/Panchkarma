import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const ToastContext = createContext();

let idSeed = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((type, message, ttl = 3500) => {
    const id = ++idSeed;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, ttl);
    return id;
  }, []);

  const showSuccess = useCallback(
    (message, ttl) => show("success", message, ttl),
    [show]
  );
  const showError = useCallback(
    (message, ttl) => show("error", message, ttl),
    [show]
  );
  const showInfo = useCallback(
    (message, ttl) => show("info", message, ttl),
    [show]
  );

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`p-3 rounded shadow-lg text-white break-words
             ${
               t.type === "success"
                 ? "bg-green-600"
                 : t.type === "error"
                 ? "bg-red-600"
                 : "bg-gray-700"
             }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
