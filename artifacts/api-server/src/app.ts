import express, { type Express, type ErrorRequestHandler } from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";
import { CLERK_PROXY_PATH, clerkProxyMiddleware, getClerkProxyHost } from "./middlewares/clerkProxyMiddleware";
import { originAccess } from "./lib/origin";

const app: Express = express();
// Replit's edge is the single trusted hop for request IP rate limiting.
app.set("trust proxy", 1);

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());
app.use(
  pinoHttp({
    logger,
    autoLogging: false,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware((req) => ({
  publishableKey: publishableKeyFromHost(getClerkProxyHost(req) ?? "", process.env.CLERK_PUBLISHABLE_KEY),
})));
// Never wildcard credentials. Untrusted cross-origin actual responses require a
// verified Clerk bearer session; only the exact Expo preview origin can submit
// unauthenticated access requests.
app.use(cors((req, callback) => {
  const access = originAccess(req);
  callback(null, {
    origin: access ? req.headers.origin : false,
    credentials: access === "same",
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
  });
}));

app.use("/api", router);

const safeErrors: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const status = typeof err === "object" && err !== null && "status" in err && typeof err.status === "number" &&
    [400, 413, 415].includes(err.status) ? err.status : 500;
  res.status(status).json({ error: status === 500 ? "Internal server error" : "Invalid request" });
};
app.use(safeErrors);

export default app;
