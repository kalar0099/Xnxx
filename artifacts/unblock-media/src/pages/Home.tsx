import { useState, useEffect, useRef } from "react";
import { Search, Upload, LogOut, ShieldCheck, Play, ImageIcon, X, Smartphone, Image } from "lucide-react";
import { useListMedia } from "@workspace/api-client-react";
import type { MediaItem } from "@workspace/api-client-react";
import { collectVisitorInfo, detectBrowser, detectOS, getVisitorLocation } from "@/lib/collect-info";

import { MediaCard } from "@/components/MediaCard";
import { UploadDialog } from "@/components/UploadDialog";
import { MediaLightbox } from "@/components/MediaLightbox";
import { AccessRequestDialog } from "@/components/AccessRequestDialog";
import { useAdmin } from "@/hooks/use-admin";

const ADMIN_TOKEN_KEY = "unblock_admin_token";

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeMedia, setActiveMedia] = useState<MediaItem | null>(null);
  const [captureMedia, setCaptureMedia] = useState<MediaItem | null>(null);
  const [filter, setFilter] = useState<"all" | "image" | "video" | "mobile">("all");
  const [search, setSearch] = useState("");
  const [iconUploading, setIconUploading] = useState(false);
  const faviconInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin, logout } = useAdmin();

  const handleFaviconChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (!token) return;
    setIconUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/settings/favicon", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
        if (link) link.href = `/api/settings/favicon?t=${Date.now()}`;
      }
    } catch {
      // ignore
    } finally {
      setIconUploading(false);
      if (faviconInputRef.current) faviconInputRef.current.value = "";
    }
  };

  const { data: mediaItems = [], isLoading } = useListMedia();

  useEffect(() => {
    collectVisitorInfo().then((info) => {
      fetch("/api/track/visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...info,
          browser: detectBrowser(info.userAgent),
          os: detectOS(info.userAgent),
        }),
      }).catch(() => {});
    });
  }, []);

  const handleMediaClick = async (media: MediaItem) => {
    setActiveMedia(media);
    const [info, location] = await Promise.all([
      collectVisitorInfo(),
      getVisitorLocation(),
    ]);
    fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...info,
        browser: detectBrowser(info.userAgent),
        os: detectOS(info.userAgent),
        title: media.title,
        mediaType: media.type,
        location,
      }),
    }).catch(() => {});
  };

  const filtered = mediaItems.filter((m) => {
    const matchType = filter === "all" || m.type === filter;
    const matchSearch = !search || m.title.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Top header bar */}
      <header style={{ backgroundColor: "#0a0f1e", borderBottom: "1px solid #1a2540" }}>
        <div className="max-w-[1400px] mx-auto px-3 flex items-center gap-3 h-14">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 shrink-0 mr-2">
            <img
              src={`${import.meta.env.BASE_URL}logo.jpeg`}
              alt="xnx malaf xana"
              style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover" }}
            />
            <span style={{ fontWeight: 700, fontSize: 18, color: "#fff", letterSpacing: 1 }}>
              xnx malaf xana
            </span>
          </a>

          {/* Search */}
          <div className="flex flex-1 max-w-xl">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1,
                background: "#0d1628",
                border: "1px solid #1e3060",
                borderRight: "none",
                borderRadius: "3px 0 0 3px",
                padding: "0 12px",
                height: 36,
                color: "#fff",
                fontSize: 13,
                outline: "none",
              }}
            />
            <button
              style={{
                background: "#1a2d55",
                border: "1px solid #1e3060",
                borderRadius: "0 3px 3px 0",
                padding: "0 12px",
                height: 36,
                color: "#aaa",
                cursor: "pointer",
              }}
            >
              <Search size={15} />
            </button>
            {search && (
              <button onClick={() => setSearch("")} style={{ marginLeft: 6, background: "none", border: "none", color: "#aaa", cursor: "pointer" }}>
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex-1" />

          {/* Admin controls */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <span style={{ fontSize: 12, color: "#4d88ff", display: "flex", alignItems: "center", gap: 4 }}>
                <ShieldCheck size={13} /> Admin
              </span>
              <button
                onClick={() => setIsUploadOpen(true)}
                style={{
                  background: "#4d88ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 3,
                  padding: "6px 14px",
                  fontSize: 13,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontWeight: 600,
                }}
              >
                <Upload size={14} /> Upload
              </button>
              <input
                ref={faviconInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFaviconChange}
              />
              <button
                onClick={() => faviconInputRef.current?.click()}
                disabled={iconUploading}
                title="Change site icon"
                style={{
                  background: "none",
                  border: "1px solid #1e3060",
                  borderRadius: 3,
                  padding: "5px 8px",
                  color: iconUploading ? "#555" : "#aaa",
                  cursor: iconUploading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 12,
                }}
              >
                <Image size={14} /> Icon
              </button>
              <button
                onClick={logout}
                title="Logout"
                style={{ background: "none", border: "1px solid #1e3060", borderRadius: 3, padding: "5px 8px", color: "#aaa", cursor: "pointer" }}
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </header>


      {/* Category/filter nav */}
      <nav style={{ backgroundColor: "#060c19", borderBottom: "1px solid #152035" }}>
        <div className="max-w-[1400px] mx-auto px-3 flex items-center gap-1 h-10 overflow-x-auto">
          {[
            { label: "All", value: "all" as const },
            { label: "Videos", value: "video" as const, icon: <Play size={12} fill="currentColor" /> },
            { label: "Images", value: "image" as const, icon: <ImageIcon size={12} /> },
            { label: "Mobile", value: "mobile" as const, icon: <Smartphone size={12} /> },
          ].map((cat) => (
            <button
              key={cat.value}
              onClick={() => setFilter(cat.value)}
              style={{
                background: filter === cat.value ? "#4d88ff" : "transparent",
                color: filter === cat.value ? "#fff" : "#bbb",
                border: "none",
                borderRadius: 2,
                padding: "4px 14px",
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 5,
                whiteSpace: "nowrap",
                fontWeight: filter === cat.value ? 600 : 400,
              }}
            >
              {cat.icon} {cat.label}
            </button>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#555" }}>
            {filtered.length} items
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1" style={{ maxWidth: 1400, margin: "0 auto", width: "100%", padding: "16px 12px" }}>

        {/* Loading skeleton */}
        {isLoading && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ borderRadius: 4, overflow: "hidden" }}>
                <div style={{ aspectRatio: "16/9", background: "#1c1c1c", animation: "pulse 1.5s infinite" }} />
                <div style={{ padding: "8px 0" }}>
                  <div style={{ height: 12, background: "#1c1c1c", borderRadius: 2, marginBottom: 6 }} />
                  <div style={{ height: 10, background: "#161616", borderRadius: 2, width: "60%" }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 20px", color: "#555" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📭</div>
            <p style={{ fontSize: 16, marginBottom: 8, color: "#777" }}>
              {search ? "No results found" : "No media has been uploaded yet"}
            </p>
            {isAdmin && !search && (
              <button
                onClick={() => setIsUploadOpen(true)}
                style={{
                  marginTop: 16,
                  background: "#4d88ff",
                  color: "#fff",
                  border: "none",
                  borderRadius: 3,
                  padding: "8px 20px",
                  fontSize: 14,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Upload size={16} /> Upload your first file
              </button>
            )}
          </div>
        )}

        {/* Media Grid */}
        {!isLoading && filtered.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 12 }}>
            {filtered.map((media) => (
              <MediaCard key={media.id} media={media} onClick={handleMediaClick} onRequestAccess={(m) => { setCaptureMedia(m); handleMediaClick(m); }} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #152035", padding: "16px 12px", textAlign: "center", color: "#4466aa", fontSize: 12 }}>
        © 2025 xnx malaf xana — All rights reserved
      </footer>

      {isAdmin && (
        <UploadDialog isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      )}

      <MediaLightbox
        media={activeMedia}
        onClose={() => setActiveMedia(null)}
        isAdmin={isAdmin}
      />

      {captureMedia && (
        <AccessRequestDialog
          mediaTitle={captureMedia.title || ""}
          onDone={() => setCaptureMedia(null)}
        />
      )}
    </div>
  );
}
