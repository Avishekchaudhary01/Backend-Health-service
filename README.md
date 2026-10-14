# SWYNEX API Project Setup — Database & CRUD

A beginner-friendly Node.js and Express API with persistent SQLite storage, validation, and CRUD operations for a `tasks` resource.

## Features

- `GET /` — service welcome message
- `GET /health` — service status, uptime, timestamp, and environment
- `POST /tasks` — create a task
- `GET /tasks` — list all tasks
- `GET /tasks/:id` — fetch one task
- `PUT /tasks/:id` — update task fields
- `DELETE /tasks/:id` — delete a task
- SQLite persistence using `better-sqlite3`
- Basic request validation and JSON error responses
- Environment configuration with `dotenv`

## Requirements

- Node.js 18 or newer
- npm

## Setup

```bash
git clone https://github.com/Avishekchaudhary01/SWYNEX-API-Project-Setup.git
cd SWYNEX-API-Project-Setup
npm install
```

Create a local `.env` file from the example.

PowerShell:
```powershell
Copy-Item .env.example .env
```

macOS/Linux:
```bash
cp .env.example .env
```

Start the server:
```bash
npm start
```

Development mode (restarts when files change):
```bash
npm run dev
```

By default, the server runs at `http://localhost:3000`. The SQLite database is created automatically at `data/tasks.db` on first start. The local database is excluded from Git.

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `NODE_ENV` | `development` | Runtime environment label |

Never commit your real `.env` file.

## API endpoints

### Health check — `GET /health`

Example response:
```json
{
  "status": "ok",
  "uptime": 12.345,
  "timestamp": "2026-10-14T04:00:00.000Z",
  "environment": "development"
}
```

The uptime and timestamp vary on each request.

### Create a task — `POST /tasks`

Send header `Content-Type: application/json` and this JSON body:
```json
{
  "title": "Learn Node.js",
  "description": "Finish the CRUD task"
}
```

Returns HTTP `201 Created` and the stored task, including its generated ID.

### List tasks — `GET /tasks`

Returns a JSON array of saved tasks. A new database returns an empty array.

### Get one task — `GET /tasks/1`

Replace `1` with the task ID. Returns `404` if it does not exist.

### Update a task — `PUT /tasks/1`

All fields are optional for partial updates. Example:
```json
{
  "completed": true
}
```

Allowed fields: `title` (non-empty string), `description` (string), and `completed` (boolean).

### Delete a task — `DELETE /tasks/1`

Deletes the task with that ID and returns a confirmation message. Returns `404` if no task exists.

## Sample requests

You can test using Postman or any HTTP client.

| Method | URL | Purpose |
|---|---|---|
| POST | `http://localhost:3000/tasks` | Create task |
| GET | `http://localhost:3000/tasks` | List tasks |
| GET | `http://localhost:3000/tasks/1` | Get task by ID |
| PUT | `http://localhost:3000/tasks/1` | Update task |
| DELETE | `http://localhost:3000/tasks/1` | Delete task |

For POST and PUT requests, select JSON as the body type. Invalid input returns HTTP `400`; a missing task returns HTTP `404`.

## License

Created for learning and API CRUD practice.
