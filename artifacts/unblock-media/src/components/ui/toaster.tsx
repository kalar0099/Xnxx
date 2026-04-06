import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-full max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`
              pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border
              ${t.variant === 'destructive' 
                ? 'bg-destructive/10 border-destructive/20 text-destructive-foreground' 
                : 'bg-card border-white/10 text-foreground'}
              backdrop-blur-md
            `}
          >
            {t.variant === 'destructive' ? (
              <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            )}
            <div className="flex-1 flex flex-col gap-1">
              {t.title && <h3 className="font-semibold text-sm">{t.title}</h3>}
              {t.description && <p className="text-sm opacity-90">{t.description}</p>}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
