import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db, mediaTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { GetMediaParams, DeleteMediaParams } from "@workspace/api-zod";

const uploadsDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
      "video/mp4", "video/webm", "video/ogg", "video/quicktime", "video/x-msvideo",
      "video/3gpp", "video/3gpp2",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not supported: ${file.mimetype}`));
    }
  },
});

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const items = await db.select().from(mediaTable).orderBy(mediaTable.createdAt);
    res.json(items);
  } catch (err) {
    req.log.error({ err }, "Failed to list media");
    res.status(500).json({ error: "Failed to list media" });
  }
});

router.post("/", (req: Request, res: Response, next: NextFunction) => {
  upload.single("file")(req, res, (multerErr) => {
    if (multerErr) {
      if (multerErr instanceof multer.MulterError && multerErr.code === "LIMIT_FILE_SIZE") {
        res.status(413).json({ error: "File is too large. Maximum size is 500MB." });
      } else {
        res.status(400).json({ error: multerErr.message || "File upload failed" });
      }
      return;
    }

    (async () => {
      try {
        if (!req.file) {
          res.status(400).json({ error: "No file uploaded" });
          return;
        }

        const mimeType = req.file.mimetype;
        const category = (req.body.category as string) || "";
        const autoType = mimeType.startsWith("video/") ? "video" : "image";
        const type = category === "mobile" ? "mobile" : autoType;
        const title = (req.body.title as string) || req.file.originalname;
        const description = (req.body.description as string) || "";
        const restricted = req.body.restricted === "true";

        const [item] = await db
          .insert(mediaTable)
          .values({
            title,
            description,
            type,
            filename: req.file.filename,
            url: `/api/media/file/${req.file.filename}`,
            size: req.file.size,
            mimeType,
            restricted,
          })
          .returning();

        res.status(201).json(item);
      } catch (err) {
        req.log.error({ err }, "Failed to upload media");
        if (req.file) {
          const filePath = path.join(uploadsDir, req.file.filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.status(500).json({ error: "Failed to upload media" });
      }
    })().catch(next);
  });
});

router.get("/file/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.sendFile(filePath);
});

router.get("/:id", async (req, res) => {
  try {
    const params = GetMediaParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }
    const [item] = await db
      .select()
      .from(mediaTable)
      .where(eq(mediaTable.id, params.data.id));

    if (!item) {
      res.status(404).json({ error: "Media not found" });
      return;
    }
    res.json(item);
  } catch (err) {
    req.log.error({ err }, "Failed to get media");
    res.status(500).json({ error: "Failed to get media" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const params = DeleteMediaParams.safeParse({ id: Number(req.params.id) });
    if (!params.success) {
      res.status(400).json({ error: "Invalid id" });
      return;
    }

    const [item] = await db
      .select()
      .from(mediaTable)
      .where(eq(mediaTable.id, params.data.id));

    if (!item) {
      res.status(404).json({ error: "Media not found" });
      return;
    }

    const filePath = path.join(uploadsDir, item.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.delete(mediaTable).where(eq(mediaTable.id, params.data.id));

    res.json({ message: "Media deleted successfully" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete media");
    res.status(500).json({ error: "Failed to delete media" });
  }
});

export default router;
