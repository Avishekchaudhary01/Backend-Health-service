require("dotenv").config();

const express = require("express");
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

app.use(express.json());

// Keep the SQLite database in a local data folder.
const dataDir = path.join(__dirname, "..", "data");
fs.mkdirSync(dataDir, { recursive: true });
const db = new Database(path.join(dataDir, "tasks.db"));

db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

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

// CREATE: POST /tasks
app.post("/tasks", (req, res) => {
  const { title, description = "" } = req.body || {};

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title is required and must be a non-empty string" });
  }
  if (typeof description !== "string") {
    return res.status(400).json({ error: "description must be a string" });
  }

  const result = db.prepare(
    "INSERT INTO tasks (title, description) VALUES (?, ?)"
  ).run(title.trim(), description.trim());

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(task);
});

// READ ALL: GET /tasks
app.get("/tasks", (req, res) => {
  const tasks = db.prepare("SELECT * FROM tasks ORDER BY id DESC").all();
  res.status(200).json(tasks);
});

// READ ONE: GET /tasks/:id
app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const task = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!task) return res.status(404).json({ error: "Task not found" });

  res.status(200).json(task);
});

// UPDATE: PUT /tasks/:id (partial updates are supported)
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const existing = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  if (!existing) return res.status(404).json({ error: "Task not found" });

  const body = req.body || {};
  const title = body.title === undefined ? existing.title : body.title;
  const description = body.description === undefined ? existing.description : body.description;
  const completed = body.completed === undefined ? Boolean(existing.completed) : body.completed;

  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({ error: "title must be a non-empty string" });
  }
  if (typeof description !== "string") {
    return res.status(400).json({ error: "description must be a string" });
  }
  if (typeof completed !== "boolean") {
    return res.status(400).json({ error: "completed must be true or false" });
  }

  db.prepare(
    "UPDATE tasks SET title = ?, description = ?, completed = ? WHERE id = ?"
  ).run(title.trim(), description.trim(), completed ? 1 : 0, id);

  const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
  res.status(200).json(updated);
});

// DELETE: DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }

  const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
  if (result.changes === 0) return res.status(404).json({ error: "Task not found" });

  res.status(200).json({ message: "Task deleted successfully", id });
});

// Invalid JSON body handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  next(err);
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

// Close database cleanly when the process is stopped.
function shutdown() {
  server.close(() => {
    db.close();
    process.exit(0);
  });
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
