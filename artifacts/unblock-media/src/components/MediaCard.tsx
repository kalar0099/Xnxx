import { Play, Eye, Smartphone } from "lucide-react";
import type { MediaItem } from "@workspace/api-client-react";

interface MediaCardProps {
  media: MediaItem;
  onClick: (media: MediaItem) => void;
  onRequestAccess: (media: MediaItem) => void;
}

export function MediaCard({ media, onClick, onRequestAccess }: MediaCardProps) {
  const isVideo = media.type === "video";
  const isMobile = media.type === "mobile";
  const isRestricted = (media as any).restricted === true;

  const handleClick = () => {
    if (isRestricted) {
      onRequestAccess(media);
    } else {
      onClick(media);
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{ cursor: "pointer", borderRadius: 3, overflow: "hidden" }}
      className="group"
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "16/9", background: "#111", overflow: "hidden" }}>
        {isVideo ? (
          <video
            src={`${media.url}#t=0.1`}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.25s" }}
            preload="metadata"
            className="group-hover:scale-105"
          />
        ) : (
          <img
            src={media.url}
            alt={media.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.25s", background: "#1a2540" }}
            className="group-hover:scale-105"
          />
        )}

        {/* Dark overlay on hover */}
        <div
          style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)", opacity: 0, transition: "opacity 0.2s" }}
          className="group-hover:opacity-100"
        />

        {/* Restricted: no overlay icons, just blurred */}
        {isRestricted ? null : (
          /* Play/Eye icon on hover */
          <div
            style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0, transition: "opacity 0.2s" }}
            className="group-hover:opacity-100"
          >
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: "rgba(0,0,0,0.75)",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "2px solid rgba(255,255,255,0.8)",
            }}>
              {isVideo
                ? <Play size={18} fill="white" color="white" style={{ marginLeft: 3 }} />
                : isMobile
                ? <Smartphone size={18} color="white" />
                : <Eye size={18} color="white" />
              }
            </div>
          </div>
        )}

        {/* Type badge — hidden for restricted items */}
        {!isRestricted && (
          <div style={{
            position: "absolute", bottom: 6, right: 6,
            background: "rgba(0,0,0,0.8)",
            color: isMobile ? "#aaa" : isVideo ? "#4d88ff" : "#44cc88",
            fontSize: 11, padding: "2px 6px", borderRadius: 2, fontWeight: 600,
          }}>
            {isMobile ? "MOBILE" : isVideo ? "VIDEO" : "IMAGE"}
          </div>
        )}
      </div>

      {/* Info below thumbnail */}
      <div style={{ padding: "7px 2px 10px" }}>
        <h3 style={{
          fontSize: 13, fontWeight: 600,
          color: "#e0e0e0",
          margin: 0, lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {media.title || "Untitled"}
        </h3>
        {media.description && (
          <p style={{
            fontSize: 11, color: "#666", margin: "3px 0 0",
            lineHeight: 1.3, display: "-webkit-box",
            WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {media.description}
          </p>
        )}
      </div>
    </div>
  );
}
