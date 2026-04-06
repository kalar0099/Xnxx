import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.post("/login", (req, res) => {
  const { password } = req.body as { password?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    res.status(500).json({ error: "Admin not configured" });
    return;
  }

  if (!password || password !== adminPassword) {
    res.status(401).json({ error: "Invalid password" });
    return;
  }

  res.json({ success: true, token: Buffer.from(`admin:${adminPassword}`).toString("base64") });
});

router.post("/verify", (req, res) => {
  const { token } = req.body as { token?: string };
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || !token) {
    res.status(401).json({ valid: false });
    return;
  }

  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const expected = `admin:${adminPassword}`;
    if (decoded === expected) {
      res.json({ valid: true });
      return;
    }
  } catch {
    // ignore
  }

  res.status(401).json({ valid: false });
});

export default router;
