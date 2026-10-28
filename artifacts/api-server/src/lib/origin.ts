import { getAuth } from "@clerk/express";
import type { Request } from "express";
import { getClerkProxyHost } from "../middlewares/clerkProxyMiddleware";

// An Origin is only trusted if it is an exact scheme/host/port match.
export function originAccess(req: Request): "same" | "expo" | "bearer" | "preflight" | null {
  const origin = req.headers.origin;
  if (!origin) return null;
  let parsed: URL;
  try {
    parsed = new URL(origin);
    if (parsed.origin !== origin || !["http:", "https:"].includes(parsed.protocol)) return null;
  } catch { return null; }
  const host = getClerkProxyHost(req);
  if (host && origin === `${req.protocol}://${host}`) return "same";

  const expoDomain = process.env.REPLIT_EXPO_DEV_DOMAIN;
  if (expoDomain && /^[a-z0-9.-]+(?::\d+)?$/i.test(expoDomain) &&
      origin === `https://${expoDomain}`) return "expo";

  // Preflight has no bearer credential. Grant only a CORS preflight for callers
  // explicitly requesting Authorization; the actual response is gated below.
  if (req.method === "OPTIONS" &&
      req.headers["access-control-request-headers"]?.split(",").some(h => h.trim().toLowerCase() === "authorization"))
    return "preflight";

  // Never fall back to a cookie-derived session for a foreign origin.
  if (req.headers.cookie || !/^Bearer [^\s]+$/i.test(req.headers.authorization ?? "")) return null;
  return getAuth(req).userId ? "bearer" : null;
}