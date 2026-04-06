import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, File, Trash2, Loader2 } from "lucide-react";
import { format } from "date-fns";
import type { MediaItem } from "@workspace/api-client-react";
import { formatBytes } from "@/lib/utils";
import { useMediaActions } from "@/hooks/use-media-actions";

interface MediaLightboxProps {
  media: MediaItem | null;
  onClose: () => void;
  isAdmin: boolean;
}

export function MediaLightbox({ media, onClose, isAdmin }: MediaLightboxProps) {
  const { deleteMedia, isDeleting } = useMediaActions();

  if (!media) return null;

  const handleDelete = () => {
    if (confirm("دڵنیایت لە سڕینەوەی ئەم مێدیایە؟")) {
      deleteMedia({ id: media.id }, {
        onSuccess: () => {
          onClose();
        }
      });
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="w-full h-full flex flex-col md:flex-row">
          {/* Media View */}
          <div className="flex-1 flex items-center justify-center p-4 md:p-12 relative h-[60vh] md:h-full">
            {media.type === 'video' ? (
              <video
                src={media.url}
                controls
                autoPlay
                className="max-w-full max-h-full rounded-lg shadow-2xl shadow-black/50"
              />
            ) : (
              <img
                src={media.url}
                alt={media.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-black/50"
              />
            )}
          </div>

          {/* Sidebar Details */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="w-full md:w-96 bg-card/80 border-l border-white/10 p-8 flex flex-col h-[40vh] md:h-full overflow-y-auto"
          >
            <div className="flex-1 flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                  {media.title || 'Untitled Media'}
                </h2>
                {media.description ? (
                  <p className="text-muted-foreground leading-relaxed">{media.description}</p>
                ) : (
                  <p className="text-muted-foreground/50 italic text-sm">هیچ وەسفێک نەنووسراوە.</p>
                )}
              </div>

              <div className="h-px w-full bg-white/10 my-2" />

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-white/80 uppercase tracking-wider">زانیاریەکان</h3>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">ئەپڵۆدکراوە</p>
                    <p className="font-medium text-white/90">{format(new Date(media.createdAt), 'PPP p')}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                    <File className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-white/60 text-xs">فایل</p>
                    <p className="font-medium text-white/90">{media.mimeType} • {formatBytes(media.size)}</p>
                  </div>
                </div>
              </div>
            </div>

            {isAdmin && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-3 px-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isDeleting ? 'سڕینەوە...' : 'سڕینەوەی مێدیا'}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
