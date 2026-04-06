import { useState, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, FileVideo, Image as ImageIcon, Loader2, Smartphone, Lock } from "lucide-react";
import { useMediaActions } from "@/hooks/use-media-actions";
import { cn } from "@/lib/utils";

interface UploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UploadDialog({ isOpen, onClose }: UploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"auto" | "mobile">("auto");
  const [restricted, setRestricted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadMedia, isUploading } = useMediaActions();

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      if (!title) {
        // Auto-fill title with filename without extension
        setTitle(e.target.files[0].name.split('.').slice(0, -1).join('.'));
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/') || droppedFile.type.startsWith('video/')) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.split('.').slice(0, -1).join('.'));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    uploadMedia(
      { data: { file, title, description, category: category === "mobile" ? "mobile" : undefined, restricted: restricted ? "true" : "false" } },
      {
        onSuccess: () => {
          setFile(null);
          setTitle("");
          setDescription("");
          setCategory("auto");
          setRestricted(false);
          onClose();
        }
      }
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg z-50 p-4"
          >
            <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-card/80">
                <h2 className="text-xl font-display font-semibold">Upload Media</h2>
                <button 
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6 overflow-y-auto">
                {!file ? (
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group",
                      isDragging 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50 hover:bg-white/5"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileSelect} 
                      className="hidden" 
                      accept="image/*,video/*"
                    />
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                      <UploadCloud className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">Click to upload or drag & drop</h3>
                    <p className="text-muted-foreground text-sm">PNG, JPG, GIF, MP4, WebM</p>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                    <button 
                      type="button"
                      onClick={() => setFile(null)}
                      className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-destructive text-white rounded-full backdrop-blur-md transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {file.type.startsWith('video/') ? (
                      <div className="aspect-video flex items-center justify-center bg-black">
                        <FileVideo className="w-16 h-16 text-white/50" />
                        <span className="absolute bottom-2 left-2 text-xs font-mono px-2 py-1 rounded bg-black/60 backdrop-blur-md">
                          {file.name}
                        </span>
                      </div>
                    ) : (
                      <div className="aspect-video relative">
                        <img 
                          src={URL.createObjectURL(file)} 
                          alt="Preview" 
                          className="w-full h-full object-contain bg-black/20"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Restricted Access toggle */}
                <div
                  onClick={() => setRestricted(!restricted)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                    border: restricted ? "1px solid rgba(77,136,255,0.5)" : "1px solid rgba(255,255,255,0.1)",
                    background: restricted ? "rgba(77,136,255,0.1)" : "rgba(0,0,0,0.2)",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Lock size={16} color={restricted ? "#4d88ff" : "#888"} />
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: restricted ? "#4d88ff" : "#aaa" }}>
                        Restricted Access
                      </div>
                      <div style={{ fontSize: 11, color: "#666", marginTop: 1 }}>
                        Visitors must request permission to view
                      </div>
                    </div>
                  </div>
                  <div style={{
                    width: 42, height: 24, borderRadius: 12,
                    background: restricted ? "#4d88ff" : "#333",
                    position: "relative", transition: "background 0.2s",
                  }}>
                    <div style={{
                      position: "absolute", top: 3,
                      left: restricted ? 21 : 3,
                      width: 18, height: 18, borderRadius: "50%",
                      background: "#fff", transition: "left 0.2s",
                    }} />
                  </div>
                </div>

                {/* Category selector */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground/80">Category</label>
                  <div className="flex gap-2">
                    {[
                      { value: "auto", label: "Auto Detect", icon: <UploadCloud className="w-4 h-4" /> },
                      { value: "mobile", label: "Mobile", icon: <Smartphone className="w-4 h-4" /> },
                    ].map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value as "auto" | "mobile")}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
                          category === cat.value
                            ? "border-primary bg-primary/20 text-primary"
                            : "border-white/10 bg-black/20 text-muted-foreground hover:border-primary/40"
                        )}
                      >
                        {cat.icon} {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="title" className="text-sm font-medium text-foreground/80">Title</label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your media a title"
                      className="px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="desc" className="text-sm font-medium text-foreground/80">Description <span className="text-muted-foreground font-normal">(Optional)</span></label>
                    <textarea
                      id="desc"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add some context..."
                      rows={3}
                      className="px-4 py-2.5 rounded-xl bg-black/20 border border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-5 py-2.5 rounded-xl font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!file || isUploading}
                    className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-5 h-5" />
                        Upload Media
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
