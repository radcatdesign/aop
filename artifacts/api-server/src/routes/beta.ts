import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { createHash } from "node:crypto";
import { and, desc, eq } from "drizzle-orm";
import {
  BetaSubmitRequestBody, BetaSubmitFeedbackBody, BetaRecordEventBody,
  BetaAdminUpdateRequestBody, BetaAdminUpdateUserBody, BetaAdminUpdateFeedbackBody,
  BetaAdminGetUsageQueryParams,
} from "@workspace/api-zod";
import { db, pool, betaRequests, betaUsers, betaFeedback } from "@workspace/db";
import { z } from "zod";
import { initialBetaAccess, canChangeAdmin } from "../lib/beta-policy";
import { originAccess } from "../lib/origin";

const router = Router();
router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});
type User = typeof betaUsers.$inferSelect;
const normalizeEmail = (email: string) => email.trim().toLowerCase();
const parse = <T extends z.ZodTypeAny>(schema: T, input: unknown): z.infer<T> => {
  const result = schema.safeParse(input);
  if (!result.success) throw new HttpError(400, "Invalid input");
  return result.data;
};
class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}
const wrap = (handler: (req: Request, res: Response) => Promise<unknown>) =>
  (req: Request, res: Response, next: NextFunction) => { Promise.resolve(handler(req, res)).catch(next); };
const id = (req: Request) => parse(z.string().uuid(), req.params.id);
const iso = (date: Date | null) => date?.toISOString() ?? null;
const wireRequest = (row: typeof betaRequests.$inferSelect) => ({ ...row, createdAt: row.createdAt.toISOString(), reviewedAt: iso(row.reviewedAt) });
const wireUser = (row: User) => ({
  id: row.id, email: row.email, name: row.name, role: row.role, status: row.status,
  acknowledged: row.acknowledged, createdAt: row.createdAt.toISOString(), lastSeenAt: iso(row.lastSeenAt),
});
const wireFeedback = (row: typeof betaFeedback.$inferSelect, user: User, admin = false) => ({
  ...row, userName: user.name, userEmail: user.email,
  adminNote: admin ? row.adminNote : null, createdAt: row.createdAt.toISOString(),
});

// Same-origin cookie mutations only. Native bearer requests normally have no Origin.
router.use((req, _res, next) => {
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(req.method) || !req.headers.origin) return next();
  if (originAccess(req)) return next();
  next(new HttpError(403, "Cross-origin request forbidden"));
});

// Atomic, database-backed windows work across app processes. Do not store raw IPs.
async function limit(kind: string, subject: string, max: number, durationMs: number) {
  const key = createHash("sha256").update(`${kind}:${subject}`).digest("hex");
  const result = await pool.query<{ count: number }>(`
    INSERT INTO beta_rate_limits (key, count, expires_at)
    VALUES ($1, 1, now() + ($2::integer * interval '1 millisecond'))
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN beta_rate_limits.expires_at <= now() THEN 1 ELSE beta_rate_limits.count + 1 END,
      expires_at = CASE WHEN beta_rate_limits.expires_at <= now() THEN excluded.expires_at ELSE beta_rate_limits.expires_at END
    RETURNING count`, [key, durationMs]);
  if (result.rows[0].count > max) throw new HttpError(429, "Too many requests");
}

async function current(req: Request): Promise<User> {
  const clerkId = getAuth(req).userId;
  if (!clerkId) throw new HttpError(401, "Authentication required");
  const [user] = await db.select().from(betaUsers).where(eq(betaUsers.clerkId, clerkId));
  if (!user) throw new HttpError(403, "Open your beta profile first");
  return user;
}
async function approved(req: Request) {
  const user = await current(req);
  if (user.status !== "approved") throw new HttpError(403, "Beta access required");
  return user;
}
async function admin(req: Request) {
  const user = await approved(req);
  if (user.role !== "admin") throw new HttpError(403, "Admin access required");
  return user;
}

router.post("/requests", wrap(async (req, res) => {
  await limit("request", req.ip ?? "unknown", 8, 3600000);
  const body = parse(BetaSubmitRequestBody.strict(), req.body);
  const email = normalizeEmail(body.email);
  const trim = (value: string) => value.trim();
  if (![body.name, body.practice, body.role, body.reason].every(v => trim(v).length > 0)) throw new HttpError(400, "Invalid input");
  await db.insert(betaRequests).values({
    email, name: trim(body.name), practice: trim(body.practice), role: trim(body.role), reason: trim(body.reason),
  }).onConflictDoNothing({ target: betaRequests.email });
  res.json({ message: "Thank you. If eligible, we'll be in touch." });
}));

router.get("/me", wrap(async (req, res) => {
  const clerkId = getAuth(req).userId;
  if (!clerkId) throw new HttpError(401, "Authentication required");
  let identity;
  try { identity = await clerkClient.users.getUser(clerkId); }
  catch { throw new HttpError(503, "Identity service unavailable"); }
  const primary = identity.emailAddresses.find(e => e.id === identity.primaryEmailAddressId && e.verification?.status === "verified");
  if (!primary) throw new HttpError(403, "A verified primary email is required");
  const email = normalizeEmail(primary.emailAddress);
  const name = `${identity.firstName ?? ""} ${identity.lastName ?? ""}`.trim() || email.split("@")[0];
  const bootstrap = normalizeEmail(process.env.BETA_BOOTSTRAP_ADMIN_EMAIL ?? "");
  // Serialize against request decisions. Only a first INSERT may bootstrap admin;
  // existing accounts never inherit the bootstrap role on later /me calls.
  const client = await pool.connect();
  let user: User;
  try {
    await client.query("BEGIN");
    const request = await client.query<{ status: "pending" | "approved" | "rejected" }>(
      "SELECT status FROM beta_requests WHERE email = $1 FOR SHARE", [email]);
    const initial = initialBetaAccess(email, bootstrap, request.rows[0]?.status);
    await client.query(`INSERT INTO beta_users (clerk_id, email, name, role, status)
      VALUES ($1, $2, $3, $4, $5) ON CONFLICT (clerk_id) DO NOTHING`,
      [clerkId, email, name, initial.role, initial.status]);
    const result = await client.query<{
      id: string; clerk_id: string; email: string; name: string; role: User["role"];
      status: User["status"]; acknowledged: boolean; last_seen_at: Date | null; created_at: Date;
    }>("SELECT * FROM beta_users WHERE clerk_id = $1 FOR UPDATE", [clerkId]);
    let row = result.rows[0];
    if (row.email !== email || row.name !== name) {
      const changed = await client.query<typeof row>(`UPDATE beta_users
        SET email = $2, name = $3,
          status = CASE WHEN email <> $2 AND role <> 'admin' AND status <> 'suspended' THEN $4 ELSE status END,
          acknowledged = CASE WHEN email <> $2 AND role <> 'admin' THEN false ELSE acknowledged END
        WHERE id = $1 RETURNING *`, [row.id, email, name,
          request.rows[0]?.status === "approved" ? "approved" : request.rows[0]?.status === "rejected" ? "rejected" : "pending"]);
      row = changed.rows[0];
    }
    user = {
      id: row.id, clerkId: row.clerk_id, email: row.email, name: row.name,
      role: row.role, status: row.status, acknowledged: row.acknowledged,
      lastSeenAt: row.last_seen_at, createdAt: row.created_at,
    };
    await client.query("COMMIT");
  } catch (err) { await client.query("ROLLBACK"); throw err; }
  finally { client.release(); }
  const { createdAt: _created, lastSeenAt: _seen, ...me } = wireUser(user);
  res.json(me);
}));

router.post("/acknowledge", wrap(async (req, res) => {
  const user = await approved(req);
  const changed = await db.update(betaUsers).set({ acknowledged: true }).where(and(eq(betaUsers.id, user.id), eq(betaUsers.status, "approved"))).returning({ id: betaUsers.id });
  if (!changed.length) throw new HttpError(403, "Beta access required");
  res.json({ message: "Acknowledged" });
}));
router.post("/feedback", wrap(async (req, res) => {
  const user = await approved(req);
  await limit("feedback", user.id, 10, 3600000);
  const body = parse(BetaSubmitFeedbackBody.strict(), req.body);
  if (!body.message.trim()) throw new HttpError(400, "Invalid input");
  // Re-check approval at write time to prevent a concurrent revocation.
  const created = await pool.query<{ id: string }>(`
    INSERT INTO beta_feedback (user_id, category, message, rating, platform, screen)
    SELECT id, $2, $3, $4, $5, $6 FROM beta_users WHERE id = $1 AND status = 'approved'
    RETURNING id`, [user.id, body.category, body.message.trim(), body.rating ?? null, body.platform, body.screen]);
  if (!created.rows.length) throw new HttpError(403, "Beta access required");
  const [row] = await db.select().from(betaFeedback).where(eq(betaFeedback.id, created.rows[0].id));
  res.json(wireFeedback(row, user));
}));
router.get("/feedback", wrap(async (req, res) => {
  const user = await approved(req);
  const rows = await db.select().from(betaFeedback).where(eq(betaFeedback.userId, user.id)).orderBy(desc(betaFeedback.createdAt)).limit(200);
  res.json(rows.map(row => wireFeedback(row, user)));
}));
router.post("/events", wrap(async (req, res) => {
  const user = await approved(req);
  await limit("event", user.id, 120, 60000);
  const body = parse(BetaRecordEventBody.strict(), req.body);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const lock = await client.query("SELECT id FROM beta_users WHERE id = $1 AND status = 'approved' FOR UPDATE", [user.id]);
    if (!lock.rows.length) throw new HttpError(403, "Beta access required");
    await client.query("INSERT INTO beta_events (user_id, event, platform, screen) VALUES ($1, $2, $3, $4)", [user.id, body.event, body.platform, body.screen]);
    await client.query("UPDATE beta_users SET last_seen_at = now() WHERE id = $1", [user.id]);
    await client.query("COMMIT");
  } catch (err) { await client.query("ROLLBACK"); throw err; }
  finally { client.release(); }
  res.json({ message: "Recorded" });
}));

router.get("/admin/requests", wrap(async (req, res) => {
  await admin(req);
  res.json((await db.select().from(betaRequests).orderBy(desc(betaRequests.createdAt)).limit(500)).map(wireRequest));
}));
router.patch("/admin/requests/:id", wrap(async (req, res) => {
  const actor = await admin(req);
  const body = parse(BetaAdminUpdateRequestBody.strict(), req.body);
  const target = id(req);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(871123)");
    const request = await client.query<{ email: string }>("SELECT email FROM beta_requests WHERE id = $1 FOR UPDATE", [target]);
    const actorNow = await client.query("SELECT id FROM beta_users WHERE id = $1 AND role = 'admin' AND status = 'approved' FOR UPDATE", [actor.id]);
    if (!actorNow.rows.length) throw new HttpError(403, "Admin access required");
    if (!request.rows.length) throw new HttpError(404, "Request not found");
    // Request review never changes admins or unsuspends testers via stale approvals.
    const conflicting = await client.query("SELECT id FROM beta_users WHERE email = $1 AND role = 'admin' AND status = 'approved'", [request.rows[0].email]);
    if (conflicting.rows.length && body.status !== "approved") throw new HttpError(409, "Manage admins in users");
    const updated = await client.query("UPDATE beta_requests SET status = $2, reviewed_at = CASE WHEN $2 = 'pending' THEN NULL ELSE now() END WHERE id = $1 RETURNING *", [target, body.status]);
    await client.query(`UPDATE beta_users SET status = $2, acknowledged = CASE WHEN $2 = 'approved' THEN acknowledged ELSE false END
      WHERE email = $1 AND role = 'tester' AND status <> 'suspended'`, [request.rows[0].email, body.status]);
    await client.query("COMMIT");
    const row = updated.rows[0] as Record<string, unknown>;
    res.json({ id: row.id, name: row.name, email: row.email, practice: row.practice, role: row.role, reason: row.reason,
      status: row.status, createdAt: (row.created_at as Date).toISOString(), reviewedAt: iso(row.reviewed_at as Date | null) });
  } catch (err) { await client.query("ROLLBACK"); throw err; }
  finally { client.release(); }
}));
router.get("/admin/users", wrap(async (req, res) => {
  await admin(req);
  res.json((await db.select().from(betaUsers).orderBy(desc(betaUsers.createdAt)).limit(500)).map(wireUser));
}));
router.patch("/admin/users/:id", wrap(async (req, res) => {
  const actor = await admin(req);
  const body = parse(BetaAdminUpdateUserBody.strict(), req.body);
  if (!body.role && !body.status) throw new HttpError(400, "Invalid input");
  const target = id(req);
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock(871123)");
    const actorNow = await client.query("SELECT id FROM beta_users WHERE id = $1 AND role = 'admin' AND status = 'approved' FOR UPDATE", [actor.id]);
    if (!actorNow.rows.length) throw new HttpError(403, "Admin access required");
    const existing = await client.query<User>("SELECT * FROM beta_users WHERE id = $1 FOR UPDATE", [target]);
    if (!existing.rows.length) throw new HttpError(404, "User not found");
    const user = existing.rows[0];
    const nextRole = body.role ?? user.role, nextStatus = body.status ?? user.status;
    const count = await client.query<{ count: string }>("SELECT count(*)::text AS count FROM beta_users WHERE role = 'admin' AND status = 'approved'");
    if (!canChangeAdmin(actor.id, target, user.role, user.status, nextRole, nextStatus, Number(count.rows[0].count)))
      throw new HttpError(409, "Cannot revoke yourself or the last approved admin");
    const changed = await client.query("UPDATE beta_users SET role = $2, status = $3, acknowledged = CASE WHEN $3 = 'approved' THEN acknowledged ELSE false END WHERE id = $1 RETURNING *", [target, nextRole, nextStatus]);
    await client.query("COMMIT");
    const row = changed.rows[0];
    res.json({ id: row.id, email: row.email, name: row.name, role: row.role, status: row.status,
      acknowledged: row.acknowledged, lastSeenAt: iso(row.last_seen_at), createdAt: row.created_at.toISOString() });
  } catch (err) { await client.query("ROLLBACK"); throw err; }
  finally { client.release(); }
}));
router.get("/admin/feedback", wrap(async (req, res) => {
  await admin(req);
  const rows = await db.select({ feedback: betaFeedback, user: betaUsers }).from(betaFeedback)
    .innerJoin(betaUsers, eq(betaFeedback.userId, betaUsers.id)).orderBy(desc(betaFeedback.createdAt)).limit(500);
  res.json(rows.map(({ feedback, user }) => wireFeedback(feedback, user, true)));
}));
router.patch("/admin/feedback/:id", wrap(async (req, res) => {
  await admin(req);
  const body = parse(BetaAdminUpdateFeedbackBody.strict(), req.body);
  if (!Object.keys(body).length) throw new HttpError(400, "Invalid input");
  const [row] = await db.update(betaFeedback).set(body).where(eq(betaFeedback.id, id(req))).returning();
  if (!row) throw new HttpError(404, "Feedback not found");
  const [user] = await db.select().from(betaUsers).where(eq(betaUsers.id, row.userId));
  res.json(wireFeedback(row, user, true));
}));
router.get("/admin/usage", wrap(async (req, res) => {
  await admin(req);
  // Express query strings are strings, whereas generated Zod expects integer literals.
  const days = parse(BetaAdminGetUsageQueryParams, {
    days: req.query.days === undefined ? undefined : typeof req.query.days === "string" && ["7", "30", "90"].includes(req.query.days) ? Number(req.query.days) : null,
  }).days;
  const from = new Date();
  from.setUTCHours(0, 0, 0, 0);
  from.setUTCDate(from.getUTCDate() - days + 1);
  const [counts, daily, features, platforms] = await Promise.all([
    pool.query(`SELECT
      (SELECT count(*)::int FROM beta_requests WHERE created_at >= $1) AS requests,
      (SELECT count(*)::int FROM beta_requests WHERE status = 'pending') AS "pendingRequests",
      (SELECT count(*)::int FROM beta_users WHERE status = 'approved') AS "approvedUsers",
      (SELECT count(DISTINCT user_id)::int FROM beta_events WHERE created_at >= $1) AS "activeUsers",
      (SELECT count(*)::int FROM beta_events WHERE created_at >= $1 AND event = 'session_start') AS sessions,
      (SELECT count(*)::int FROM beta_feedback WHERE created_at >= $1) AS feedback`, [from]),
    pool.query(`SELECT to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
      count(DISTINCT user_id)::int AS "activeUsers", count(*)::int AS events
      FROM beta_events WHERE created_at >= $1 GROUP BY 1 ORDER BY 1`, [from]),
    pool.query(`SELECT event, count(*)::int AS count FROM beta_events WHERE created_at >= $1 GROUP BY event ORDER BY event`, [from]),
    pool.query(`SELECT platform, count(*)::int AS count FROM beta_events WHERE created_at >= $1 GROUP BY platform ORDER BY platform`, [from]),
  ]);
  const byDate = new Map(daily.rows.map(row => [row.date, row]));
  const dates = Array.from({ length: days }, (_, i) => {
    const day = new Date(from); day.setUTCDate(from.getUTCDate() + i);
    const date = day.toISOString().slice(0, 10);
    return byDate.get(date) ?? { date, activeUsers: 0, events: 0 };
  });
  res.json({ totals: counts.rows[0], daily: dates, features: features.rows, platforms: platforms.rows });
}));

router.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) { res.status(err.status).json({ error: err.message }); return; }
  // Never return DB details, tokens, or submitted content to clients or logs.
  res.status(500).json({ error: "Internal server error" });
});
export default router;