require("dotenv").config();

const crypto = require("crypto");
const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const API_KEY = process.env.API_KEY || "";

app.disable("x-powered-by");
app.use(express.json({ limit: "10kb" }));

// Persistent SQLite storage.
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "tasks.db"));

db.exec(\`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
\`);

function sendError(res, status, code, message) {
  return res.status(status).json({ error: { code, message } });
}

// Protect every /tasks endpoint with a server-side API key.
function requireApiKey(req, res, next) {
  if (!API_KEY) {
    return sendError(res, 503, "AUTH_NOT_CONFIGURED", "API authentication is not configured on the server");
  }

  const provided = req.get("x-api-key");
  if (typeof provided !== "string") {
    return sendError(res, 401, "UNAUTHORIZED", "A valid x-api-key header is required");
  }

  const expectedBuffer = Buffer.from(API_KEY);
  const providedBuffer = Buffer.from(provided);
  const valid = expectedBuffer.length === providedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, providedBuffer);

  if (!valid) {
    return sendError(res, 401, "UNAUTHORIZED", "A valid x-api-key header is required");
  }
  next();
}

function validateTaskPayload(body, { partial = false } = {}) {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return "Request body must be a JSON object";
  }

  const allowed = new Set(["title", "description", "completed"]);
  const unknown = Object.keys(body).find((key) => !allowed.has(key));
  if (unknown) return \`Unknown field: \${unknown}\`;

  if (!partial && (typeof body.title !== "string" || !body.title.trim())) {
    return "title is required and must be a non-empty string";
  }
  if (body.title !== undefined) {
    if (typeof body.title !== "string" || !body.title.trim()) {
      return "title must be a non-empty string";
    }
    if (body.title.trim().length > 120) return "title must be 120 characters or fewer";
  }

  if (body.description !== undefined) {
    if (typeof body.description !== "string") return "description must be a string";
    if (body.description.length > 1000) return "description must be 1000 characters or fewer";
  }

  if (body.completed !== undefined && typeof body.completed !== "boolean") {
    return "completed must be true or false";
  }

  if (partial && Object.keys(body).length === 0) {
    return "Provide at least one field to update";
  }
  return null;
}

function parseTaskId(rawId) {
  if (!/^[1-9]\d*$/.test(rawId)) return null;
  const id = Number(rawId);
  return Number.isSafeInteger(id) ? id : null;
}

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend Health Service is running",
    environment: NODE_ENV
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: NODE_ENV
  });
});

// Authentication applies to create, read, update, and delete routes.
app.use("/tasks", requireApiKey);

// CREATE: POST /tasks
app.post("/tasks", (req, res) => {
  const validationError = validateTaskPayload(req.body);
  if (validationError) return sendError(res, 400, "VALIDATION_ERROR", validationError);

  const title = req.body.title.trim();
  const description = (req.body.description || "").trim();
  const result = db.prepare(
    "INSERT INTO tasks (title, description) VALUES (?, ?)"
  ).run(title, description);

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  return res.status(201).json(task);
});

// READ ALL: GET /tasks
app.get("/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks ORDER BY id DESC").all();
  return res.status(200).json(tasks);
});

// READ ONE: GET /tasks/:id
app.get("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  if (!id) return sendError(res, 400, "VALIDATION_ERROR", "id must be a positive integer");

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task) return sendError(res, 404, "NOT_FOUND", "Task not found");
  return res.status(200).json(task);
});

// UPDATE: PUT /tasks/:id (partial updates supported)
app.put("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  if (!id) return sendError(res, 400, "VALIDATION_ERROR", "id must be a positive integer");

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!existing) return sendError(res, 404, "NOT_FOUND", "Task not found");

  const validationError = validateTaskPayload(req.body, { partial: true });
  if (validationError) return sendError(res, 400, "VALIDATION_ERROR", validationError);

  const title = req.body.title === undefined ? existing.title : req.body.title.trim();
  const description = req.body.description === undefined ? existing.description : req.body.description.trim();
  const completed = req.body.completed === undefined ? Boolean(existing.completed) : req.body.completed;

  db.prepare(
    "UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?"
  ).run(title, description, completed ? 1 : 0, id);

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  return res.status(200).json(updated);
});

// DELETE: DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const id = parseTaskId(req.params.id);
  if (!id) return sendError(res, 400, "VALIDATION_ERROR", "id must be a positive integer");

  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  if (result.changes === 0) return sendError(res, 404, "NOT_FOUND", "Task not found");
  return res.status(200).json({ message: "Task deleted successfully", id });
});

// Normalize malformed JSON and oversized payload responses.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return sendError(res, 400, "INVALID_JSON", "Request body contains invalid JSON");
  }
  if (err && err.type === "entity.too.large") {
    return sendError(res, 413, "PAYLOAD_TOO_LARGE", "Request body must be 10kb or smaller");
  }
  return next(err);
});

app.use((req, res) => sendError(res, 404, "ROUTE_NOT_FOUND", "Route not found"));

app.use((err, req, res, next) => {
  console.error(err);
  return sendError(res, 500, "INTERNAL_SERVER_ERROR", "An unexpected error occurred");
});

const server = app.listen(PORT, () => {
  console.log(\`Server is running at http://localhost:\${PORT}\`);
});

function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
