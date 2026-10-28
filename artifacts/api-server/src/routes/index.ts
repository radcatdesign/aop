import { Router, type IRouter } from "express";
import healthRouter from "./health";
import betaRouter from "./beta";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/beta", betaRouter);

export default router;
