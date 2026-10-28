import app from "./app";
import { logger } from "./lib/logger";

// Replit sets PORT. Vercel doesn't (it routes requests to the app itself),
// so fall back instead of crashing the function on startup.
const rawPort = process.env["PORT"] ?? "3000";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

export default app;
