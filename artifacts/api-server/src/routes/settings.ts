import { Router, type IRouter } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, settingsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    cb(null, "favicon" + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/x-icon", "image/svg+xml"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only image files allowed"));
  },
});

function isAdmin(req: any): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  const authHeader = req.headers.authorization as string | undefined;
  if (!authHeader?.startsWith("Bearer ")) return false;
  const token = authHeader.slice(7);
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    return decoded === `admin:${adminPassword}`;
  } catch {
    return false;
  }
}

const router: IRouter = Router();

router.get("/favicon", async (req, res) => {
  try {
    const rows = await db.select().from(settingsTable).where(eq(settingsTable.key, "favicon_path"));
    if (!rows.length || !rows[0].value) {
      res.status(404).json({ error: "No favicon set" });
      return;
    }
    const filePath = rows[0].value;
    if (!fs.existsSync(filePath)) {
      res.status(404).json({ error: "Favicon file not found" });
      return;
    }
    res.sendFile(filePath);
  } catch (err) {
    req.log.error({ err }, "Failed to get favicon");
    res.status(500).json({ error: "Failed to get favicon" });
  }
});

router.post("/favicon", upload.single("file"), async (req, res) => {
  if (!isAdmin(req)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }
    const filePath = path.resolve(uploadsDir, req.file.filename);
    await db
      .insert(settingsTable)
      .values({ key: "favicon_path", value: filePath })
      .onConflictDoUpdate({ target: settingsTable.key, set: { value: filePath, updatedAt: new Date() } });
    res.json({ success: true, url: "/api/settings/favicon" });
  } catch (err) {
    req.log.error({ err }, "Failed to update favicon");
    res.status(500).json({ error: "Failed to update favicon" });
  }
});

export default router;
