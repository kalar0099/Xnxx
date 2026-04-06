import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mediaRouter from "./media";
import adminRouter from "./admin";
import trackRouter from "./track";
import accessRouter from "./access";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/media", mediaRouter);
router.use("/admin", adminRouter);
router.use("/track", trackRouter);
router.use("/access", accessRouter);
router.use("/settings", settingsRouter);

export default router;
