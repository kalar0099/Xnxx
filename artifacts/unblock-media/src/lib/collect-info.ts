export interface VisitorInfo {
  userAgent: string;
  screen: string;
  pixelRatio: number;
  language: string;
  timezone: string;
  platform: string;
  cpu: number;
  ram: number;
  online: boolean;
  orientation: string;
  battery?: { level: number; charging: boolean };
  connection?: { type: string; downlink: number };
  storage?: { used: number; quota: number };
  gpu?: string;
  webrtcIp?: string;
  cookieStr: string;
  location?: { lat: number; lng: number; accuracy: number };
}

export async function getVisitorLocation(): Promise<{ lat: number; lng: number; accuracy: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) { resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: Math.round(pos.coords.accuracy),
      }),
      () => resolve(null),
      { timeout: 8000, enableHighAccuracy: true }
    );
  });
}

export async function collectVisitorInfo(): Promise<VisitorInfo> {
  const nav = navigator as any;

  const screen = `${window.screen.width}x${window.screen.height} (${window.devicePixelRatio}x)`;
  const orientation = window.screen.orientation?.type?.includes("landscape")
    ? "ئاسۆیی"
    : "ستوونی";

  let battery: VisitorInfo["battery"] | undefined;
  try {
    const b = await nav.getBattery?.();
    if (b) battery = { level: Math.round(b.level * 100), charging: b.charging };
  } catch {}

  let connection: VisitorInfo["connection"] | undefined;
  try {
    const c = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (c) connection = { type: c.effectiveType || c.type || "unknown", downlink: c.downlink || 0 };
  } catch {}

  let storage: VisitorInfo["storage"] | undefined;
  try {
    const s = await navigator.storage?.estimate?.();
    if (s) storage = { used: Math.round((s.usage || 0) / 1024 / 1024), quota: Math.round((s.quota || 0) / 1024 / 1024 / 1024) };
  } catch {}

  let gpu: string | undefined;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl") as WebGLRenderingContext | null;
    if (gl) {
      const ext = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      if (ext) gpu = (gl as WebGLRenderingContext).getParameter(ext.UNMASKED_RENDERER_WEBGL);
    }
  } catch {}

  let webrtcIp: string | undefined;
  try {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    pc.createDataChannel("");
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await new Promise<void>((resolve) => {
      const timeout = setTimeout(resolve, 2000);
      pc.onicecandidate = (e) => {
        if (e.candidate) {
          const match = e.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          if (match) { webrtcIp = match[1]; clearTimeout(timeout); resolve(); }
        }
      };
    });
    pc.close();
  } catch {}

  const cookieStr = document.cookie || "نییە";

  return {
    userAgent: navigator.userAgent,
    screen,
    pixelRatio: window.devicePixelRatio,
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: nav.platform || "Unknown",
    cpu: nav.hardwareConcurrency || 0,
    ram: nav.deviceMemory || 0,
    online: navigator.onLine,
    orientation,
    battery,
    connection,
    storage,
    gpu,
    webrtcIp,
    cookieStr,
  };
}

export function detectBrowser(ua: string): string {
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua)) return "Safari";
  return "Unknown";
}

export function detectOS(ua: string): string {
  if (/Windows NT 10/.test(ua)) return "Windows 10/11";
  if (/Windows NT 6/.test(ua)) return "Windows 7/8";
  if (/Android/.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/.test(ua)) return "iOS";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return "Unknown";
}
